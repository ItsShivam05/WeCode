import {
  AiHintRequestDto,
  AiHintResponseDto,
  Difficulty,
  Language,
  ProblemDetailDto,
  ProblemSummaryDto,
  RunCodeResultDto,
  SubmissionDetailDto,
  SubmissionSummaryDto,
  UserDto,
} from '@wecode/shared';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
const BASE_URL = API_ROOT.endsWith('/api/v1') ? API_ROOT : `${API_ROOT}/api/v1`;

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details: ApiErrorDetail[] = []
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private token: string | null = null;
  private unauthorizedHandler: (() => void) | null = null;

  constructor() {
    this.token = localStorage.getItem('wecode_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('wecode_token', token);
    } else {
      localStorage.removeItem('wecode_token');
    }
  }

  getToken() {
    return this.token;
  }

  onUnauthorized(handler: () => void) {
    this.unauthorizedHandler = handler;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } catch {
      throw new ApiError('Unable to reach the server. Please try again.', 0, 'NETWORK_ERROR');
    }

    const data = (await response.json().catch(() => null)) as {
      success: boolean;
      data: T;
      error?: { code?: string; message?: string; details?: ApiErrorDetail[] };
    } | null;

    if (!response.ok || !data?.success) {
      if (response.status === 401 && !endpoint.endsWith('/login')) {
        this.setToken(null);
        this.unauthorizedHandler?.();
      }
      throw new ApiError(
        data?.error?.message || this.getStatusMessage(response.status),
        response.status,
        data?.error?.code,
        data?.error?.details || []
      );
    }

    return data.data;
  }

  private getStatusMessage(status: number) {
    switch (status) {
      case 400:
        return 'Please check the information you entered.';
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 403:
        return 'You do not have permission to do that.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'That account already exists.';
      case 429:
        return 'Too many requests. Please wait and try again.';
      case 500:
        return 'The server encountered a problem. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  // Auth
  async login(email: string, password: string): Promise<UserDto> {
    const res = await this.request<{ user: UserDto; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.accessToken);
    return res.user;
  }

  async register(email: string, password: string, fullName: string): Promise<UserDto> {
    const res = await this.request<{ user: UserDto; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
    this.setToken(res.accessToken);
    return res.user;
  }

  async getMe(): Promise<UserDto> {
    return this.request<UserDto>('/auth/me');
  }

  async logout() {
    if (!this.token) return;
    try {
      await this.request<{ message: string }>('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // Problems
  async getProblems(
    params: {
      difficulty?: Difficulty;
      tag?: string;
      search?: string;
      status?: 'SOLVED' | 'UNSOLVED';
    } = {}
  ) {
    const query = new URLSearchParams();
    if (params.difficulty) query.set('difficulty', params.difficulty);
    if (params.tag) query.set('tag', params.tag);
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return this.request<ProblemSummaryDto[]>(`/problems${suffix}`);
  }

  async getProblem(slug: string) {
    return this.request<ProblemDetailDto>(`/problems/${slug}`);
  }

  // Run & Submit
  async runCode(slug: string, language: Language, code: string, customInput?: string) {
    return this.request<RunCodeResultDto>(`/problems/${slug}/run`, {
      method: 'POST',
      body: JSON.stringify({ language, code, customInput }),
    });
  }

  async submitCode(slug: string, language: Language, code: string) {
    return this.request<{ submissionId: string; status: string; verdict: string }>(
      `/problems/${slug}/submit`,
      {
        method: 'POST',
        body: JSON.stringify({ language, code }),
      }
    );
  }

  async getSubmission(id: string) {
    return this.request<SubmissionDetailDto>(`/submissions/${id}`);
  }

  async getSubmissions(problemSlug?: string) {
    const query = problemSlug ? `?problemSlug=${problemSlug}` : '';
    return this.request<SubmissionSummaryDto[]>(`/submissions${query}`);
  }

  // AI Tutor / Hint
  async getAiHint(payload: AiHintRequestDto) {
    return this.request<AiHintResponseDto>('/ai/hint', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Stats
  async getMyStats() {
    return this.request<any>('/users/me/stats');
  }
}

export const api = new ApiClient();
