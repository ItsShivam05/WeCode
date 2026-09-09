import { Language } from '@wecode/shared';

export interface CompileOptions {
  language: Language;
  sourceCode: string;
  workspaceDir: string;
}

export interface CompileResult {
  success: boolean;
  output: string;
  binaryPath?: string;
}

export interface ExecutionOptions {
  binaryPath: string;
  stdin: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  workspaceDir: string;
}

export interface RawExecutionResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  memoryKb: number;
  timedOut: boolean;
  oomKilled: boolean;
}

export interface SandboxDriver {
  compile(options: CompileOptions): Promise<CompileResult>;
  execute(options: ExecutionOptions): Promise<RawExecutionResult>;
  cleanup(workspaceDir: string): Promise<void>;
}
