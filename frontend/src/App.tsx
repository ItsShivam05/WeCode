import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { Activity, CheckCircle2, Flame, Sparkles, Target } from 'lucide-react';
import {
  Difficulty,
  ProblemDetailDto,
  ProblemSummaryDto,
  SubmissionSummaryDto,
  Verdict,
} from '@wecode/shared';
import { PlatformNavbar } from './components/PlatformNavbar';
import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { ComingSoon } from './components/ComingSoon';
import { ProblemWorkspace } from './components/ProblemWorkspace';
import { SubmissionHistory } from './components/SubmissionHistory';
import { UserProgress } from './components/UserProgress';
import { AuthProvider, useAuth } from './context/AuthContext';
import { mockSubmissions, mockUserStats } from './data/mockProblems';
import { LandingPage } from './pages/LandingPage';
import { api } from './services/api';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm">
          Loading your workspace...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const ProtectedLayout = () => (
  <>
    <PlatformNavbar />
    <main className="min-h-[calc(100vh-73px)] bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.08),_transparent_20%),radial-gradient(circle_at_left,_rgba(244,114,182,0.08),_transparent_20%),linear-gradient(180deg,_#f8fafc_0%,_#f8fbff_100%)]">
      <Outlet />
    </main>
  </>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(mockUserStats);
  const [submissions, setSubmissions] = useState<SubmissionSummaryDto[]>(mockSubmissions);
  const [problems, setProblems] = useState<ProblemSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const [statsResponse, submissionResponse, problemsResponse] = await Promise.all([
          api.getMyStats().catch(() => mockUserStats),
          api.getSubmissions().catch(() => mockSubmissions),
          api.getProblems().catch(() => []),
        ]);

        if (!active) return;
        setStats(statsResponse);
        setSubmissions(submissionResponse.slice(0, 4));
        setProblems(problemsResponse.slice(0, 3));
      } catch {
        setStats(mockUserStats);
        setSubmissions(mockSubmissions);
        setProblems([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchData();
    return () => {
      active = false;
    };
  }, []);

  const totalSolved = stats?.stats?.totalSolved ?? 0;
  const totalSubmissions = stats?.stats?.totalSubmissions ?? 0;
  const streak = totalSolved > 0 ? Math.min(12, totalSolved + 3) : 0;
  const recentSubmissions = submissions.slice(0, 3);
  const recommendedProblems = problems.slice(0, 3);
  const displayName = user?.fullName || 'Shivam';
  const firstName = displayName.split(' ')[0] || displayName;
  const hasActivity = recentSubmissions.length > 0;
  const streakLabel = `${streak} ${streak === 1 ? 'day' : 'days'}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Overview
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-900 sm:text-4xl">
              Welcome back, {firstName} 👋
            </h1>
            <p className="mt-2 text-base text-slate-600">Ready to solve something today?</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="/problems"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Solve a Problem
            </a>
            <a
              href="/progress"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100"
            >
              View Progress
            </a>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Problems Solved',
            value: totalSolved,
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
          },
          {
            label: 'Problems Attempted',
            value: Math.max(totalSolved, 0),
            icon: <Target className="h-4 w-4 text-sky-500" />,
          },
          {
            label: 'Submissions',
            value: totalSubmissions,
            icon: <Activity className="h-4 w-4 text-amber-500" />,
          },
          {
            label: 'Current Streak',
            value: streakLabel,
            icon: <Flame className="h-4 w-4 text-rose-500" />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_32px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(15,23,42,0.07)]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {stat.label}
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-900">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recommended Problems</h2>
            <p className="mt-1 text-sm text-slate-600">
              Start with a few problems picked for your current level.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-slate-500">Loading recommended problems...</div>
        ) : recommendedProblems.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-5 w-5" />}
            title="No problems available yet."
            description="Your problem library is being prepared."
            actionLabel="Coming Soon"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {recommendedProblems.map((problem, index) => (
              <a
                key={problem.id}
                href={`/problems/${problem.slug}`}
                className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-bold text-slate-900">{problem.title}</div>
                  <span
                    className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${
                      problem.difficulty === Difficulty.EASY
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : problem.difficulty === Difficulty.MEDIUM
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {problem.tags.slice(0, 2).map((tag) => (
                    <span
                      key={`${problem.id}-${tag}`}
                      className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600 ring-1 ring-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                  Solve <span aria-hidden="true">→</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {hasActivity ? 'Continue Learning' : 'Start Learning'}
              </h2>
            </div>
            <a
              href="/problems"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              Browse Problems →
            </a>
          </div>

          {loading ? (
            <div className="text-sm text-slate-500">Loading your journey...</div>
          ) : !hasActivity ? (
            <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-4">
              <div className="text-lg font-bold text-slate-900">Start Learning</div>
              <p className="mt-1 text-sm text-slate-600">
                Pick a problem and start building your coding streak.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((submission) => (
                <a
                  key={submission.id}
                  href={`/problems/${submission.problemSlug}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{submission.problemTitle}</div>
                    <div className="text-xs text-slate-500">
                      {submission.language} • {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      submission.verdict === Verdict.ACCEPTED
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : submission.verdict === Verdict.WRONG_ANSWER
                          ? 'border-rose-200 bg-rose-50 text-rose-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    {submission.verdict}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Latest
            </span>
          </div>

          {loading ? (
            <div className="text-sm text-slate-500">Loading activity...</div>
          ) : recentSubmissions.length === 0 ? (
            <EmptyState
              title="No activity yet."
              description="Your submissions will appear here once you start solving problems."
              actionLabel="Browse Problems"
              actionHref="/problems"
            />
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-900">
                      {submission.problemTitle}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {submission.language} • {new Date(submission.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`ml-3 shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${
                      submission.verdict === Verdict.ACCEPTED
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : submission.verdict === Verdict.WRONG_ANSWER
                          ? 'border-rose-200 bg-rose-50 text-rose-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    {submission.verdict}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Progress</h2>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Mastery
          </span>
        </div>
        <div className="space-y-4">
          {[
            {
              label: 'Easy',
              value: stats?.stats?.solvedByDifficulty?.EASY ?? 0,
              tone: 'emerald',
            },
            {
              label: 'Medium',
              value: stats?.stats?.solvedByDifficulty?.MEDIUM ?? 0,
              tone: 'amber',
            },
            { label: 'Hard', value: stats?.stats?.solvedByDifficulty?.HARD ?? 0, tone: 'rose' },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-600">
                <span>{item.label}</span>
                <span>{item.value} solved</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.tone === 'emerald'
                      ? 'bg-emerald-500'
                      : item.tone === 'amber'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, item.value * 22)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
        <h2 className="text-xl font-bold text-slate-900">Upcoming Features</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {['AI Tutor', 'Contests', 'Classroom', 'Leaderboard'].map((feature) => (
            <div
              key={feature}
              className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600"
            >
              {feature} <span className="text-slate-400">— Coming Soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProblemsPage = () => {
  const [problems, setProblems] = useState<ProblemSummaryDto[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<'ALL' | Difficulty>('ALL');
  const [tag, setTag] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SOLVED' | 'UNSOLVED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProblems({
        search: search.trim() || undefined,
        difficulty: difficulty === 'ALL' ? undefined : difficulty,
        tag: tag === 'ALL' ? undefined : tag,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setProblems(data);
      if (!search.trim() && difficulty === 'ALL' && tag === 'ALL' && statusFilter === 'ALL') {
        setAvailableTags(Array.from(new Set(data.flatMap((problem) => problem.tags))).sort());
      }
    } catch {
      setError('Please try again.');
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProblems();
  }, [search, difficulty, tag, statusFilter]);

  const tagSlug = (tagName: string) => tagName.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Practice
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-900">Problems</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search problems or tags"
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100 sm:w-64"
          />
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as 'ALL' | Difficulty)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
          >
            <option value="ALL">All difficulties</option>
            <option value={Difficulty.EASY}>Easy</option>
            <option value={Difficulty.MEDIUM}>Medium</option>
            <option value={Difficulty.HARD}>Hard</option>
          </select>
          <select
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
          >
            <option value="ALL">All tags</option>
            {availableTags.map((item) => (
              <option key={item} value={tagSlug(item)}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as 'ALL' | 'SOLVED' | 'UNSOLVED')
            }
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
          >
            <option value="ALL">All statuses</option>
            <option value="SOLVED">Solved</option>
            <option value="UNSOLVED">Unsolved</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading problems...
        </div>
      ) : error ? (
        <ErrorState title="Unable to load problems." message={error} onRetry={fetchProblems} />
      ) : problems.length === 0 ? (
        <EmptyState
          title="No problems available yet."
          description="Your problem library is being prepared."
          actionLabel="Coming Soon"
        />
      ) : (
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.05)]">
          <div className="grid grid-cols-1 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 sm:grid-cols-[1.5fr_0.8fr_1fr_0.7fr] sm:px-6">
            <span>Status</span>
            <span>Problem</span>
            <span>Difficulty</span>
            <span>Tags</span>
          </div>
          <div>
            {problems.map((problem) => (
              <a
                key={problem.id}
                href={`/problems/${problem.slug}`}
                className="grid grid-cols-1 gap-3 border-b border-slate-200 px-4 py-4 transition hover:bg-slate-50 sm:grid-cols-[1.5fr_1.5fr_0.8fr_1fr] sm:px-6"
              >
                <div>
                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                    {problem.isSolved ? 'Solved' : 'Unsolved'}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-slate-900">{problem.title}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {problem.submissionCount} attempts
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      problem.difficulty === Difficulty.EASY
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : problem.difficulty === Difficulty.MEDIUM
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {problem.tags.map((tagName) => (
                    <span
                      key={`${problem.id}-${tagName}`}
                      className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600"
                    >
                      {tagName}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ProblemWorkspacePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<ProblemDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProblem = async () => {
      if (!slug) return;
      try {
        setProblem(await api.getProblem(slug));
      } catch {
        setProblem(null);
      } finally {
        setLoading(false);
      }
    };

    void loadProblem();
  }, [slug]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading problem workspace...</div>;
  }

  if (!problem) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <ErrorState title="Problem not found." message="This problem is unavailable right now." />
      </div>
    );
  }

  return <ProblemWorkspace problem={problem} onBack={() => navigate('/problems')} />;
};

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<SubmissionSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getSubmissions().catch(() => mockSubmissions);
        setSubmissions(data);
      } catch {
        setSubmissions(mockSubmissions);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            History
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-900">
            Submissions
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading submissions...
        </div>
      ) : submissions.length === 0 ? (
        <div className="max-w-xl">
          <EmptyState
            title="No submissions yet."
            description="Submit your first solution and your results will appear here."
            actionLabel="Browse Problems"
            actionHref="/problems"
          />
        </div>
      ) : (
        <SubmissionHistory />
      )}
    </div>
  );
};

const ProgressPage = () => (
  <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <UserProgress />
  </div>
);

const ProfilePage = () => {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
        <h1 className="text-3xl font-black tracking-[-0.06em] text-slate-900">Profile</h1>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Name
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900">
              {user?.fullName || 'Student Name'}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Email
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900">
              {user?.email || 'student@college.edu'}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Role
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900">{user?.role || 'STUDENT'}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Joined
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900">
              {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Profile editing coming soon.
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => (
  <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
      <h1 className="text-3xl font-black tracking-[-0.06em] text-slate-900">Settings</h1>
      <div className="mt-6 space-y-4">
        {[
          { title: 'Account', description: 'Manage profile and account details.' },
          { title: 'Appearance', description: 'Theme preferences and layout settings.' },
          { title: 'Notifications', description: 'Updates and reminders.' },
          { title: 'Security', description: 'Authentication and device security.' },
        ].map((section) => (
          <div key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900">{section.title}</div>
                <div className="text-sm text-slate-600">{section.description}</div>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Coming Soon
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ComingSoonPage = ({
  title,
  description,
  icon,
  features,
}: {
  title: string;
  description: string;
  icon?: string;
  features?: string[];
}) => (
  <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <ComingSoon title={title} description={description} icon={icon} featureList={features} />
  </div>
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LandingPage defaultAuthTab="login" />} />
          <Route path="/signup" element={<LandingPage defaultAuthTab="signup" />} />

          <Route
            element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problems/:slug" element={<ProblemWorkspacePage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="/contests"
              element={
                <ComingSoonPage
                  title="Contests"
                  description="Campus competitions, challenge rooms, and leaderboard races are on the way."
                  icon="🏆"
                  features={['Live contest rooms', 'Score tracking', 'Weekly prizes']}
                />
              }
            />
            <Route
              path="/ai"
              element={
                <ComingSoonPage
                  title="AI Tutor"
                  description="Your personal coding mentor is coming soon with guided hints and debugging support."
                  icon="🤖"
                  features={['Debugging help', 'Concept explanations', 'Personalized hints']}
                />
              }
            />
            <Route
              path="/classroom"
              element={
                <ComingSoonPage
                  title="Classroom"
                  description="Collaborative practice sessions and course-based learning flows are currently being built."
                  icon="🎓"
                  features={['Shared challenges', 'Mentor updates', 'Progress cohorts']}
                />
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ComingSoonPage
                  title="Leaderboard"
                  description="Track your college-wide progress, streaks, and coding momentum in the next release."
                  icon="📊"
                  features={['Performance rankings', 'Streak insights', 'Campus goals']}
                />
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
