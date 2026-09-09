import React from 'react';
import { Code2, BookOpen, History, BarChart2, LogIn, LogOut } from 'lucide-react';

interface NavbarProps {
  currentView: 'problems' | 'workspace' | 'history' | 'stats';
  onNavigate: (view: 'problems' | 'history' | 'stats') => void;
  user: any;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenAuthModal,
  onLogout,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate('problems')}
        >
          <div className="p-2 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white">WeCode</span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              College Edition
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onNavigate('problems')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${
              currentView === 'problems' || currentView === 'workspace'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Problems
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${
              currentView === 'history'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            Submissions
          </button>
          <button
            onClick={() => onNavigate('stats')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${
              currentView === 'stats'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Progress
          </button>
        </nav>

        {/* User / Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-300">
                {user.fullName || user.email}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded bg-rose-500/10 border border-rose-500/20 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
