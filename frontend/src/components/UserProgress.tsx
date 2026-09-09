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
    return <div className="text-center py-16 text-slate-400">Loading your progress...</div>;
  }

  const solved = stats?.stats?.totalSolved ?? 0;
  const submissions = stats?.stats?.totalSubmissions ?? 0;
  const byDiff = stats?.stats?.solvedByDifficulty || { EASY: 0, MEDIUM: 0, HARD: 0 };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white tracking-tight mb-2">My Learning Progress</h1>
      <p className="text-sm text-slate-400 mb-8">
        Track your problem-solving metrics and mastery across algorithmic difficulty tiers.
      </p>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Problems Solved</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{solved}</div>
          <span className="text-xs text-slate-500 mt-1 block">Unique problems accepted</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Submissions</span>
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{submissions}</div>
          <span className="text-xs text-slate-500 mt-1 block">Evaluated attempts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Acceptance Rate</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">
            {submissions > 0 ? Math.round((solved / submissions) * 100) : 0}%
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Solution success ratio</span>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-400" /> Mastery by Difficulty
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-emerald-400">Easy</span>
              <span className="text-slate-300">{byDiff.EASY || 0} Solved</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (byDiff.EASY || 0) * 10)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-amber-400">Medium</span>
              <span className="text-slate-300">{byDiff.MEDIUM || 0} Solved</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (byDiff.MEDIUM || 0) * 10)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-rose-400">Hard</span>
              <span className="text-slate-300">{byDiff.HARD || 0} Solved</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (byDiff.HARD || 0) * 10)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
