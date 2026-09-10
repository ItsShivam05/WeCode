import type { ReactNode } from 'react';

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: ReactNode;
  featureList?: string[];
}

export const ComingSoon = ({ title, description, icon, featureList = [] }: ComingSoonProps) => {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-8">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 via-yellow-50 to-teal-100 text-3xl text-slate-800 shadow-sm">
        {icon ?? '✨'}
      </div>

      <div className="mt-6 text-center">
        <h2 className="text-3xl font-black tracking-[-0.06em] text-slate-900">{title}</h2>
        <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>

        {featureList.length > 0 && (
          <ul className="mt-5 space-y-2 text-left text-sm text-slate-600">
            {featureList.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-600">
          Coming Soon
        </div>
      </div>
    </div>
  );
};
