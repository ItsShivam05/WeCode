export const CodingVisual = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_30px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-8">
        <div className="mb-5 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-pink-400" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.6rem] border border-slate-200 bg-slate-950 p-5 text-left shadow-inner">
            <pre className="overflow-hidden text-[11px] leading-6 text-slate-200 sm:text-xs md:text-sm">
              <code>{`function solve(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (map.has(need)) return [map.get(need), i];
    map.set(nums[i], i);
  }
}

console.log(solve([2, 7, 11, 15], 9));`}</code>
            </pre>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-[1.6rem] bg-gradient-to-br from-[#f9fafb] via-[#eef7ff] to-[#eefcf7] p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Live Insight
              </p>
              <h3 className="mt-3 text-3xl font-black tracking-[-0.06em] text-slate-900">
                Build real problem-solving habits
              </h3>
            </div>

            <div className="space-y-4 rounded-[1.4rem] border border-white/70 bg-white/80 p-4">
              {[
                ['Tackled', '146 problems'],
                ['Solved', '89% accuracy'],
                ['Streak', '12 days'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-600">{label}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-900">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
