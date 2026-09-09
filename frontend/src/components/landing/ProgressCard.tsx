import { ArrowUpRight, TrendingUp } from 'lucide-react';

export const ProgressCard = () => {
  return (
    <div className="floating-card min-w-0 rounded-3xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_22px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Progress</p>
          <h4 className="mt-1 text-xl font-black tracking-[-0.06em] text-slate-900">82%</h4>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-600">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400" />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Track growth</span>
          <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
            +24% <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
