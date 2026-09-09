import { Trophy } from 'lucide-react';

export const ContestCard = () => {
  return (
    <div className="floating-card min-w-0 rounded-3xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_20px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Compete
          </p>
          <h4 className="mt-1 text-lg font-black tracking-[-0.05em] text-slate-900">Weekly Rank</h4>
        </div>
        <div className="rounded-2xl bg-amber-50 p-2 text-amber-600">
          <Trophy className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>Leaderboard</span>
          <span className="font-semibold text-slate-900">#12</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-slate-100 px-2 py-1.5">
          <span>Points</span>
          <span className="font-semibold text-pink-600">1,240</span>
        </div>
      </div>
    </div>
  );
};
