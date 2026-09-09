import { Logo } from '../branding/Logo';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <Logo className="h-12 w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
            WeCode helps students learn, practice, and compete with confidence in one polished
            coding experience.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Product
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>
              <a href="#" className="hover:text-slate-900">
                Problems
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-slate-900">
                Contests
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-slate-900">
                Practice
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Company
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>
              <a href="#" className="hover:text-slate-900">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-slate-900">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Resources
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>
              <a href="#" className="hover:text-slate-900">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-slate-900">
                Help
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-slate-900">
                GitHub
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-slate-900">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
