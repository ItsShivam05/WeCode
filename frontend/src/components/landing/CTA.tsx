export const CTA = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="rounded-[2.2rem] bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 px-6 py-10 text-center shadow-[0_30px_60px_rgba(15,23,42,0.2)] sm:px-10 lg:px-14 lg:py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink-300">
          Your next solution starts here
        </p>
        <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-white sm:text-5xl">
          Practice smarter. <span className="text-pink-300">Compete harder.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          Grow together with a coding platform designed for curiosity, progress, and momentum.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <button className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-amber-300 px-6 py-3.5 text-base font-semibold text-slate-900 shadow-[0_20px_35px_rgba(244,114,182,0.35)] transition hover:-translate-y-0.5">
            Start Coding
          </button>
          <button className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10">
            Explore Problems
          </button>
        </div>
      </div>
    </section>
  );
};
