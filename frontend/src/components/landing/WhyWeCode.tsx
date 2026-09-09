import { BrainCircuit, ChartNoAxesCombined, Rocket, ShieldCheck } from 'lucide-react';

const reasons = [
  {
    icon: BrainCircuit,
    title: 'Practice with purpose',
    description:
      'Build confidence through rigorous exercises that reinforce the right thinking habits.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Track your growth',
    description: 'See progress over time with a clear view of strengths, milestones, and momentum.',
  },
  {
    icon: Rocket,
    title: 'Compete with your peers',
    description: 'Turn learning into strategy with real contests and leaderboard energy.',
  },
  {
    icon: ShieldCheck,
    title: 'Learn with AI',
    description: 'Get guided support without losing the joy of independent problem-solving.',
  },
];

export const WhyWeCode = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
            Why WeCode
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-black tracking-[-0.07em] text-slate-900 sm:text-5xl">
            The platform built for students who want to{' '}
            <span className="text-sky-600">grow faster</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            WeCode helps students build the habits, speed, and confidence that matter most in
            technical interviews, coding contests, and modern university coursework.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {reasons.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-5 shadow-[0_14px_28px_rgba(15,23,42,0.04)]"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-50 text-sky-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold tracking-[-0.05em] text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
