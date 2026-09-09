import { BookOpen, Rocket, Sparkles, Trophy } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Practice',
    description: 'Curated coding problems tailored to the skills students need to master.',
    accent: 'from-pink-100 to-rose-50 text-pink-600',
  },
  {
    icon: Sparkles,
    title: 'Community',
    description: 'Learn together through peer support, discussions, and collaborative momentum.',
    accent: 'from-emerald-100 to-teal-50 text-emerald-600',
  },
  {
    icon: Rocket,
    title: 'Track',
    description: 'Visualize progress with clear milestones and performance insights over time.',
    accent: 'from-sky-100 to-cyan-50 text-sky-600',
  },
  {
    icon: Trophy,
    title: 'Compete',
    description: 'Participate in contests that turn practice into polished, measurable growth.',
    accent: 'from-amber-100 to-yellow-50 text-amber-700',
  },
];

export const Features = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink-500">
          Why students choose us
        </p>
        <h2 className="mt-4 text-4xl font-black tracking-[-0.07em] text-slate-900 sm:text-5xl">
          Everything needed to <span className="text-pink-500">level up</span>
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {features.map(({ icon: Icon, title, description, accent }) => (
          <div
            key={title}
            className="group rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_18px_35px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.08)]"
          >
            <div
              className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold tracking-[-0.05em] text-slate-900">{title}</h3>
            <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
