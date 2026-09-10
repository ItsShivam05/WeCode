import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, Flame, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

export const UserProgress: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getMyStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load user stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-500">Loading your progress...</div>;
  }

  const solved = stats?.stats?.totalSolved ?? 0;
  const submissions = stats?.stats?.totalSubmissions ?? 0;
  const byDiff = stats?.stats?.solvedByDifficulty || { EASY: 0, MEDIUM: 0, HARD: 0 };
  const acceptanceRate = submissions > 0 ? Math.round((solved / submissions) * 100) : 0;

  const difficultyRows = [
    {
      label: 'Easy',
      value: byDiff.EASY ?? 0,
      tone: 'emerald',
      accent: 'bg-emerald-500',
      text: 'text-emerald-700',
      track: 'bg-emerald-100',
    },
    {
      label: 'Medium',
      value: byDiff.MEDIUM ?? 0,
      tone: 'amber',
      accent: 'bg-amber-500',
      text: 'text-amber-700',
      track: 'bg-amber-100',
    },
    {
      label: 'Hard',
      value: byDiff.HARD ?? 0,
      tone: 'rose',
      accent: 'bg-rose-500',
      text: 'text-rose-700',
      track: 'bg-rose-100',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Overview</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-900">
          My Learning Progress
        </h1>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Problems Solved
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-900">{solved}</div>
          <div className="mt-1 text-sm text-slate-500">Unique problems accepted</div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Total Submissions
            </span>
            <Flame className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-900">
            {submissions}
          </div>
          <div className="mt-1 text-sm text-slate-500">Evaluated attempts</div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Acceptance Rate
            </span>
            <TrendingUp className="h-5 w-5 text-sky-500" />
          </div>
          <div className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-900">
            {acceptanceRate}%
          </div>
          <div className="mt-1 text-sm text-slate-500">Solution success ratio</div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-6">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-slate-900">
          <Award className="h-5 w-5 text-sky-600" />
          Mastery by Difficulty
        </h2>
        <div className="space-y-4">
          {difficultyRows.map((row) => {
            const pct =
              row.value > 0 ? Math.min(100, (row.value / Math.max(1, solved || 1)) * 100) : 0;
            return (
              <div key={row.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-600">
                  <span className={row.text}>{row.label}</span>
                  <span>
                    {row.value} solved
                    <span className="ml-2 text-slate-400">/ {Math.max(row.value, 0)}</span>
                  </span>
                </div>
                <div className={`h-2.5 overflow-hidden rounded-full ${row.track}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${row.accent}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
