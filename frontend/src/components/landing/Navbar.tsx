import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Logo } from '../branding/Logo';

const navItems = ['Home', 'Problems', 'Contests', 'Discuss', 'About'];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/60 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center" aria-label="WeCode home">
          <Logo className="h-10 w-auto sm:h-12" />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item, index) => (
            <a
              key={item}
              href={index === 0 ? '#home' : '#'}
              className={`relative text-sm font-medium transition-colors duration-200 ${
                item === 'Home' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item}
              {item === 'Home' && (
                <span className="absolute -bottom-2 left-1/2 h-1.5 w-7 -translate-x-1/2 rounded-full bg-gradient-to-r from-pink-400 to-amber-300" />
              )}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <button className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2">
            Get Started
          </button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow-sm md:hidden"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200/80 bg-white/90 px-4 py-4 shadow-lg backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {item}
              </a>
            ))}
            <button className="mt-2 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
