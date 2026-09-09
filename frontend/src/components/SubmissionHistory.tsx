import React, { useEffect, useState } from 'react';
import { SubmissionSummaryDto, Verdict } from '@wecode/shared';
import { Clock, Cpu } from 'lucide-react';
import { api } from '../services/api';

export const SubmissionHistory: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionSummaryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getSubmissions();
        setSubmissions(data);
      } catch (err) {
        console.error('Failed to load submissions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getVerdictStyle = (v: Verdict) => {
    switch (v) {
      case Verdict.ACCEPTED:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case Verdict.WRONG_ANSWER:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case Verdict.TIME_LIMIT_EXCEEDED:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case Verdict.COMPILATION_ERROR:
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white tracking-tight mb-2">My Submission History</h1>
      <p className="text-sm text-slate-400 mb-6">
        View past submissions, evaluation verdicts, and performance metrics.
      </p>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          You have not submitted any solutions yet.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Problem</th>
                <th className="px-6 py-3.5">Verdict</th>
                <th className="px-6 py-3.5">Language</th>
                <th className="px-6 py-3.5">Runtime</th>
                <th className="px-6 py-3.5">Memory</th>
                <th className="px-6 py-3.5 text-right">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-medium text-white">{sub.problemTitle}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded border ${getVerdictStyle(
                        sub.verdict
                      )}`}
                    >
                      {sub.verdict}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-300">{sub.language}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {sub.executionTimeMs ?? 0} ms
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-slate-500" />
                      {sub.memoryKb ?? 0} KB
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-400">
                    {new Date(sub.createdAt).toLocaleString()}
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
