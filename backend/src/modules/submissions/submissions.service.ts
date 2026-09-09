import {
  Language,
  Role,
  RunnerTask,
  SubmissionDetailDto,
  SubmissionResultDto,
  SubmissionStatus,
  SubmissionSummaryDto,
  Verdict,
} from '@wecode/shared';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { enqueueSubmissionTask } from '../../queue/submission-queue';

export class SubmissionsService {
  async submitCode(
    userId: string,
    problemSlug: string,
    language: Language,
    code: string
  ): Promise<{ submissionId: string; status: SubmissionStatus; verdict: Verdict }> {
    const problem = await prisma.problem.findUnique({
      where: { slug: problemSlug },
      include: {
        testCases: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!problem || !problem.isPublished) {
      throw new AppError(404, 'PROBLEM_NOT_FOUND', 'Problem not found or is unpublished');
    }

    if (!problem.testCases.length) {
      throw new AppError(400, 'NO_TEST_CASES', 'This problem does not have test cases configured');
    }

    // 1. Create submission row in database
    const submission = await prisma.submission.create({
      data: {
        userId,
        problemId: problem.id,
        language,
        code,
        status: SubmissionStatus.PENDING,
        verdict: Verdict.QUEUED,
      },
    });

    // 2. Prepare Runner Task
    const task: RunnerTask = {
      taskId: `sub-${submission.id}`,
      submissionId: submission.id,
      problemId: problem.id,
      language,
      code,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitMb: problem.memoryLimitMb,
      testCases: problem.testCases.map((tc) => ({
        id: tc.id,
        orderIndex: tc.orderIndex,
        isSample: tc.isSample,
        inputData: tc.inputData,
        expectedOutput: tc.expectedOutput,
        points: tc.points,
      })),
      isSubmission: true,
    };

    // 3. Enqueue to BullMQ
    try {
      await enqueueSubmissionTask(task);
    } catch (queueErr) {
      // In case Redis is down during dev, don't crash, update status
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          status: SubmissionStatus.COMPLETED,
          verdict: Verdict.SYSTEM_ERROR,
          errorMessage: 'Queue service currently unavailable',
        },
      });
      throw new AppError(503, 'QUEUE_UNAVAILABLE', 'Submission queue is temporarily offline');
    }

    return {
      submissionId: submission.id,
      status: SubmissionStatus.PENDING,
      verdict: Verdict.QUEUED,
    };
  }

  async getSubmissionById(
    submissionId: string,
    currentUserId: string,
    role: Role
  ): Promise<SubmissionDetailDto> {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        problem: true,
        user: true,
        results: {
          include: {
            testCase: true,
          },
          orderBy: {
            testCase: {
              orderIndex: 'asc',
            },
          },
        },
      },
    });

    if (!submission) {
      throw new AppError(404, 'SUBMISSION_NOT_FOUND', 'Submission not found');
    }

    // Users can only view their own submissions unless they are Admin or Faculty
    if (submission.userId !== currentUserId && role !== Role.ADMIN && role !== Role.FACULTY) {
      throw new AppError(403, 'FORBIDDEN', 'You cannot view other users submissions');
    }

    const isAdmin = role === Role.ADMIN || role === Role.FACULTY;

    // Mask hidden test case details unless user is admin
    const maskedResults: SubmissionResultDto[] = submission.results.map((r) => {
      const isSample = r.testCase.isSample;

      return {
        id: r.id,
        testCaseId: r.testCaseId,
        orderIndex: r.testCase.orderIndex,
        isSample,
        verdict: r.verdict as Verdict,
        executionTimeMs: r.executionTimeMs,
        memoryKb: r.memoryKb,
        // SECURITY: Never expose inputData/expectedOutput/stdout/stderr for hidden test cases to students!
        inputData: isSample || isAdmin ? r.testCase.inputData : undefined,
        expectedOutput: isSample || isAdmin ? r.testCase.expectedOutput : undefined,
        stdout: isSample || isAdmin ? (r.stdout ?? undefined) : undefined,
        stderr: isSample || isAdmin ? (r.stderr ?? undefined) : undefined,
      };
    });

    return {
      id: submission.id,
      userId: submission.userId,
      userFullName: submission.user.fullName,
      problemId: submission.problemId,
      problemTitle: submission.problem.title,
      problemSlug: submission.problem.slug,
      language: submission.language as Language,
      code: submission.code,
      status: submission.status as SubmissionStatus,
      verdict: submission.verdict as Verdict,
      executionTimeMs: submission.executionTimeMs,
      memoryKb: submission.memoryKb,
      errorMessage: submission.errorMessage,
      results: maskedResults,
      createdAt: submission.createdAt.toISOString(),
    };
  }

  async listUserSubmissions(
    userId: string,
    problemSlug?: string,
    page = 1,
    limit = 20
  ): Promise<{ submissions: SubmissionSummaryDto[]; total: number }> {
    const skip = (page - 1) * limit;
    const whereClause: any = { userId };

    if (problemSlug) {
      const problem = await prisma.problem.findUnique({
        where: { slug: problemSlug },
      });
      if (problem) {
        whereClause.problemId = problem.id;
      }
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where: whereClause,
        include: {
          problem: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.submission.count({ where: whereClause }),
    ]);

    const formatted: SubmissionSummaryDto[] = submissions.map((s) => ({
      id: s.id,
      problemId: s.problemId,
      problemTitle: s.problem.title,
      problemSlug: s.problem.slug,
      language: s.language as Language,
      status: s.status as SubmissionStatus,
      verdict: s.verdict as Verdict,
      executionTimeMs: s.executionTimeMs,
      memoryKb: s.memoryKb,
      createdAt: s.createdAt.toISOString(),
    }));

    return { submissions: formatted, total };
  }
}

export const submissionsService = new SubmissionsService();
