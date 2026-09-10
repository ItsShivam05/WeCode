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
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case Verdict.WRONG_ANSWER:
        return 'border-rose-200 bg-rose-50 text-rose-700';
      case Verdict.TIME_LIMIT_EXCEEDED:
        return 'border-amber-200 bg-amber-50 text-amber-700';
      case Verdict.COMPILATION_ERROR:
        return 'border-orange-200 bg-orange-50 text-orange-700';
      default:
        return 'border-slate-200 bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {loading ? (
        <div className="py-10 text-center text-sm text-slate-500">Loading submissions...</div>
      ) : submissions.length === 0 ? null : (
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Problem</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">Runtime</th>
                  <th className="px-4 py-3">Memory</th>
                  <th className="px-4 py-3 text-right">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{sub.problemTitle}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getVerdictStyle(
                          sub.verdict
                        )}`}
                      >
                        {sub.verdict}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{sub.language}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {sub.executionTimeMs ?? 0} ms
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-slate-400" />
                        {sub.memoryKb ?? 0} KB
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500">
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
