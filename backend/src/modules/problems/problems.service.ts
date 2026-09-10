import { Prisma } from '@prisma/client';
import { Difficulty, ProblemDetailDto, ProblemSummaryDto, Role, Verdict } from '@wecode/shared';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';

export class ProblemsService {
  async listProblems(params: {
    difficulty?: Difficulty;
    tag?: string;
    search?: string;
    status?: 'SOLVED' | 'UNSOLVED';
    page?: number;
    limit?: number;
    role?: Role;
    userId?: string;
  }): Promise<{ problems: ProblemSummaryDto[]; total: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ProblemWhereInput = {};

    // Normal students only see published problems
    if (params.role !== Role.ADMIN && params.role !== Role.FACULTY) {
      whereClause.isPublished = true;
    }

    if (params.difficulty) {
      whereClause.difficulty = params.difficulty;
    }

    if (params.search) {
      whereClause.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { slug: { contains: params.search, mode: 'insensitive' } },
        {
          problemTags: {
            some: {
              tag: { name: { contains: params.search, mode: 'insensitive' } },
            },
          },
        },
      ];
    }

    if (params.tag) {
      whereClause.problemTags = {
        some: {
          tag: {
            slug: params.tag.toLowerCase(),
          },
        },
      };
    }

    if (params.userId && params.status === 'SOLVED') {
      whereClause.submissions = {
        some: { userId: params.userId, verdict: 'ACCEPTED' },
      };
    }

    if (params.userId && params.status === 'UNSOLVED') {
      whereClause.submissions = {
        none: { userId: params.userId, verdict: 'ACCEPTED' },
      };
    }

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where: whereClause,
        include: {
          problemTags: {
            include: { tag: true },
          },
          _count: {
            select: {
              submissions: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.problem.count({ where: whereClause }),
    ]);

    const acceptedProblemIds = params.userId
      ? new Set(
          (
            await prisma.submission.findMany({
              where: {
                userId: params.userId,
                verdict: 'ACCEPTED',
                problemId: { in: problems.map((problem) => problem.id) },
              },
              select: { problemId: true },
              distinct: ['problemId'],
            })
          ).map((submission) => submission.problemId)
        )
      : new Set<string>();

    const formattedProblems: ProblemSummaryDto[] = problems.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty as Difficulty,
      tags: p.problemTags.map((pt) => pt.tag.name),
      submissionCount: p._count.submissions,
      acceptedCount: 0, // Computed or cached in production
      isSolved: acceptedProblemIds.has(p.id),
      isPublished: p.isPublished,
      createdAt: p.createdAt.toISOString(),
    }));

    return { problems: formattedProblems, total };
  }

  async getProblemBySlug(slug: string, userId?: string): Promise<ProblemDetailDto> {
    const problem = await prisma.problem.findUnique({
      where: { slug },
      include: {
        problemTags: {
          include: { tag: true },
        },
        // SECURITY: Strictly only select test cases where isSample is true!
        testCases: {
          where: { isSample: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!problem || (!problem.isPublished && !userId)) {
      throw new AppError(404, 'PROBLEM_NOT_FOUND', 'Problem not found');
    }

    let userSubmissionStatus: Verdict | null = null;
    if (userId) {
      const latestSubmission = await prisma.submission.findFirst({
        where: { problemId: problem.id, userId },
        orderBy: { createdAt: 'desc' },
        select: { verdict: true },
      });
      if (latestSubmission) {
        userSubmissionStatus = latestSubmission.verdict as unknown as Verdict;
      }
    }

    return {
      id: problem.id,
      slug: problem.slug,
      title: problem.title,
      descriptionMarkdown: problem.descriptionMarkdown,
      difficulty: problem.difficulty as Difficulty,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitMb: problem.memoryLimitMb,
      tags: problem.problemTags.map((pt) => pt.tag.name),
      sampleTestCases: problem.testCases.map((tc) => ({
        id: tc.id,
        inputData: tc.inputData,
        expectedOutput: tc.expectedOutput,
        isSample: tc.isSample,
        orderIndex: tc.orderIndex,
      })),
      userSubmissionStatus,
      createdAt: problem.createdAt.toISOString(),
    };
  }

  async createProblem(
    data: {
      title: string;
      slug: string;
      descriptionMarkdown: string;
      difficulty: Difficulty;
      timeLimitMs: number;
      memoryLimitMb: number;
      tags: string[];
      isPublished?: boolean;
    },
    creatorId: string
  ) {
    const existing = await prisma.problem.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new AppError(409, 'SLUG_EXISTS', 'Problem slug is already taken');
    }

    // Connect or create tags
    const tagConnectOrCreate = data.tags.map((tagName) => {
      const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
      return {
        tag: {
          connectOrCreate: {
            where: { slug: tagSlug },
            create: { name: tagName, slug: tagSlug },
          },
        },
      };
    });

    return prisma.problem.create({
      data: {
        title: data.title,
        slug: data.slug,
        descriptionMarkdown: data.descriptionMarkdown,
        difficulty: data.difficulty,
        timeLimitMs: data.timeLimitMs,
        memoryLimitMb: data.memoryLimitMb,
        isPublished: data.isPublished ?? false,
        createdById: creatorId,
        problemTags: {
          create: tagConnectOrCreate,
        },
      },
      include: {
        problemTags: {
          include: { tag: true },
        },
      },
    });
  }

  async addTestCase(
    problemId: string,
    data: {
      inputData: string;
      expectedOutput: string;
      isSample: boolean;
      points: number;
      orderIndex: number;
    }
  ) {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });
    if (!problem) {
      throw new AppError(404, 'PROBLEM_NOT_FOUND', 'Problem not found');
    }

    return prisma.testCase.create({
      data: {
        problemId,
        inputData: data.inputData,
        expectedOutput: data.expectedOutput,
        isSample: data.isSample,
        points: data.points,
        orderIndex: data.orderIndex,
      },
    });
  }
}

export const problemsService = new ProblemsService();
