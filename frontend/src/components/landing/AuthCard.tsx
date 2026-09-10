import { FormEvent, useEffect, useState } from 'react';
import { UserDto } from '@wecode/shared';
import { ArrowRight, Check, Code2, Lock, Mail, Sparkles } from 'lucide-react';
import { Logo } from '../branding/Logo';
import { ApiError } from '../../services/api';

interface AuthCardProps {
  user: UserDto | null;
  initialTab?: 'login' | 'signup';
  onLogin: (email: string, password: string) => Promise<UserDto>;
  onRegister: (email: string, password: string, fullName: string) => Promise<UserDto>;
  onLogout: () => Promise<void>;
}

export const AuthCard = ({
  user,
  initialTab = 'login',
  onLogin,
  onRegister,
  onLogout,
}: AuthCardProps) => {
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTab(initialTab);
    setError(null);
  }, [initialTab]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (tab === 'login') await onLogin(email, password);
      else await onRegister(email, password, fullName);
    } catch (caughtError) {
      const apiError = caughtError instanceof ApiError ? caughtError : null;
      const detail = apiError?.details.map((item) => item.message).join(' ');
      setError(detail || apiError?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    return (
      <div className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
          Welcome back
        </p>
        <h3 id="auth-card" className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-900">
          {user.fullName}
        </h3>
        <p className="mt-2 text-sm text-slate-500">{user.email}</p>
        <button
          type="button"
          onClick={() => void onLogout()}
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/60 bg-white/80 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:p-6">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-pink-200/60 blur-2xl" />
      <div className="absolute -left-7 bottom-10 h-20 w-20 rounded-full bg-cyan-200/70 blur-2xl" />

      <div className="relative">
        <div className="mb-5 flex items-center">
          <Logo className="h-12 w-auto" />
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
            Welcome back
          </p>
          <h3 id="auth-card" className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-900">
            Join the next wave
          </h3>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              tab === 'login'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              tab === 'signup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <div className="space-y-2">
              <label htmlFor="full-name" className="text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="full-name"
                type="text"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Alex Johnson"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-100"
              />
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@college.edu"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <button
                type="button"
                className="text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-pink-300 focus:bg-white focus:ring-4 focus:ring-pink-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" className="h-4 w-4 accent-pink-500" />
              Remember me
            </label>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">
              <Sparkles className="h-3 w-3" />
              AI-ready
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-pink-400 to-orange-300 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(244,114,182,0.32)] transition duration-200 hover:-translate-y-0.5"
          >
            {isSubmitting
              ? 'Connecting...'
              : tab === 'login'
                ? 'Login to dashboard'
                : 'Create account'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          Or continue with
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 10.2V14h5.5c-.2 1.3-1.4 3.9-5.5 3.9-3.3 0-5.9-2.7-5.9-6.1S8.7 5.9 12 5.9c1.9 0 3.2.8 3.9 1.5l2.6-2.6C16.7 3.1 14.6 2.2 12 2.2 6.9 2.2 2.8 6.3 2.8 11.4S6.9 20.6 12 20.6c6.9 0 11.5-4.8 11.5-11.6 0-.8-.1-1.4-.2-2H12Z"
              />
            </svg>
            Google
          </button>

          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
            <Code2 className="h-4 w-4" />
            GitHub
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500">
          <span>{tab === 'login' ? 'New here?' : 'Already a member?'}</span>
          <button
            type="button"
            onClick={() => {
              setTab(tab === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            className="font-semibold text-pink-600 transition hover:text-pink-500"
          >
            {tab === 'login' ? 'Create account' : 'Login instead'}
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3 text-sm text-emerald-700">
          <div className="flex items-center gap-2 font-medium">
            <Check className="h-4 w-4" />
            Trusted by 5,000+ students
          </div>
        </div>
      </div>
    </div>
  );
};
