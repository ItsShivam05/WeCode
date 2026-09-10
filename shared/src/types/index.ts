import { Difficulty, Language, Role, SubmissionStatus, Verdict } from '../enums';

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface TestCaseDto {
  id: string;
  inputData: string;
  expectedOutput: string;
  isSample: boolean;
  orderIndex: number;
}

export interface AdminTestCaseDto extends TestCaseDto {
  points: number;
}

export interface ProblemSummaryDto {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  submissionCount: number;
  acceptedCount: number;
  isSolved?: boolean;
  isPublished: boolean;
  createdAt: string;
}

export interface ProblemDetailDto {
  id: string;
  slug: string;
  title: string;
  descriptionMarkdown: string;
  difficulty: Difficulty;
  timeLimitMs: number;
  memoryLimitMb: number;
  tags: string[];
  sampleTestCases: TestCaseDto[];
  userSubmissionStatus?: Verdict | null;
  createdAt: string;
}

export interface RunCodeRequestDto {
  language: Language;
  code: string;
  customInput?: string;
}

export interface RunCodeResultDto {
  verdict: Verdict;
  executionTimeMs: number;
  memoryKb: number;
  stdout: string;
  stderr: string;
  compileOutput?: string;
}

export interface SubmitCodeRequestDto {
  language: Language;
  code: string;
}

export interface SubmissionResultDto {
  id: string;
  testCaseId: string;
  orderIndex: number;
  isSample: boolean;
  verdict: Verdict;
  executionTimeMs: number;
  memoryKb: number;
  // Note: stdout, stderr, and sample inputs are only populated if isSample is true
  stdout?: string;
  stderr?: string;
  inputData?: string;
  expectedOutput?: string;
}

export interface SubmissionDetailDto {
  id: string;
  userId: string;
  userFullName?: string;
  problemId: string;
  problemTitle?: string;
  problemSlug?: string;
  language: Language;
  code: string;
  status: SubmissionStatus;
  verdict: Verdict;
  executionTimeMs: number | null;
  memoryKb: number | null;
  errorMessage?: string | null;
  results: SubmissionResultDto[];
  createdAt: string;
}

export interface SubmissionSummaryDto {
  id: string;
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  language: Language;
  status: SubmissionStatus;
  verdict: Verdict;
  executionTimeMs: number | null;
  memoryKb: number | null;
  createdAt: string;
}

// Queue Runner Contracts
export interface TestCaseToJudge {
  id: string;
  orderIndex: number;
  isSample: boolean;
  inputData: string;
  expectedOutput: string;
  points: number;
}

export interface RunnerTask {
  taskId: string;
  submissionId?: string; // Optional if transient run
  problemId: string;
  language: Language;
  code: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  testCases: TestCaseToJudge[];
  isSubmission: boolean;
}

export interface SingleExecutionResult {
  testCaseId: string;
  orderIndex: number;
  isSample: boolean;
  verdict: Verdict;
  executionTimeMs: number;
  memoryKb: number;
  stdout: string;
  stderr: string;
}

export interface RunnerResult {
  taskId: string;
  submissionId?: string;
  status: SubmissionStatus;
  verdict: Verdict;
  compileOutput?: string;
  executionTimeMs: number;
  memoryKb: number;
  testCaseResults: SingleExecutionResult[];
  errorMessage?: string;
}

// Standard API Responses
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

// Phase 2 Boundary: AI Interface Contracts
export interface AiHintRequestDto {
  problemId: string;
  code: string;
  language: Language;
  lastVerdict?: Verdict;
  errorOutput?: string;
  hintLevel?: 'CONCEPTUAL' | 'ALGORITHMIC' | 'SYNTACTIC';
}

export interface AiHintResponseDto {
  hint: string;
  guidanceType: string;
  remainingDailyQuota: number;
}
