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
} from '@wecode/shared';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

class ApiClient {
  private token: string | null = null;

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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMsg = data.error?.message || 'An error occurred';
      throw new Error(errorMsg);
    }

    return data.data;
  }

  // Auth
  async login(email: string, password: string) {
    const res = await this.request<{ user: any; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.accessToken);
    return res.user;
  }

  async register(email: string, password: string, fullName: string) {
    const res = await this.request<{ user: any; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
    this.setToken(res.accessToken);
    return res.user;
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Problems
  async getProblems(difficulty?: Difficulty) {
    const query = difficulty ? `?difficulty=${difficulty}` : '';
    return this.request<ProblemSummaryDto[]>(`/problems${query}`);
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
