import React, { useState } from 'react';
import { Difficulty, ProblemSummaryDto } from '@wecode/shared';
import { ChevronRight, Search, Tag, CheckCircle2 } from 'lucide-react';

interface ProblemListProps {
  problems: ProblemSummaryDto[];
  onSelectProblem: (slug: string) => void;
  isLoading: boolean;
}

export const ProblemList: React.FC<ProblemListProps> = ({
  problems,
  onSelectProblem,
  isLoading,
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredProblems = problems.filter((p) => {
    const matchesDiff = filterDifficulty === 'ALL' || p.difficulty === filterDifficulty;
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDiff && matchesSearch;
  });

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case Difficulty.EASY:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case Difficulty.MEDIUM:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case Difficulty.HARD:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Coding Problems</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse algorithmic challenges and practice with deterministic automated evaluation.
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search problems or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterDifficulty(tab)}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  filterDifficulty === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problem Table / Cards */}
      {isLoading ? (
        <div className="flex justify-center py-16 text-slate-400">Loading problems...</div>
      ) : filteredProblems.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          No problems matched your current filter criteria.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Difficulty</th>
                <th className="px-6 py-3.5">Tags</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProblems.map((prob) => (
                <tr
                  key={prob.id}
                  onClick={() => onSelectProblem(prob.slug)}
                  className="hover:bg-slate-800/40 transition cursor-pointer group"
                >
                  <td className="px-6 py-4 font-medium text-white group-hover:text-blue-400 transition flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-600" />
                    {prob.title}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded border ${getDifficultyBadge(
                        prob.difficulty
                      )}`}
                    >
                      {prob.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {prob.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded"
                        >
                          <Tag className="w-2.5 h-2.5 text-slate-400" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 group-hover:translate-x-0.5 transition">
                      Solve <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
