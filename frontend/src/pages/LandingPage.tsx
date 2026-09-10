import { ArrowRight, Code2, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/landing/AuthCard';
import { CodingVisual } from '../components/landing/CodingVisual';
import { ContestCard } from '../components/landing/ContestCard';
import { CTA } from '../components/landing/CTA';
import { Features } from '../components/landing/Features';
import { FloatingCodeCard } from '../components/landing/FloatingCodeCard';
import { Footer } from '../components/landing/Footer';
import { Navbar } from '../components/landing/Navbar';
import { ProgressCard } from '../components/landing/ProgressCard';
import { Reveal } from '../components/landing/Reveal';
import { WhyWeCode } from '../components/landing/WhyWeCode';
import { useAuth } from '../context/AuthContext';

export const LandingPage = ({
  defaultAuthTab = 'login',
}: {
  defaultAuthTab?: 'login' | 'signup';
}) => {
  const { user, isLoading, login, register, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    const nextUser = await login(email, password);
    navigate('/dashboard', { replace: true });
    return nextUser;
  };

  const handleRegister = async (email: string, password: string, fullName: string) => {
    const nextUser = await register(email, password, fullName);
    navigate('/dashboard', { replace: true });
    return nextUser;
  };

  useEffect(() => {
    if (user && ['/', '/login', '/signup'].includes(window.location.pathname)) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, user]);

  return (
    <div className="landing-page relative min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(252,165,165,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(125,211,252,0.18),_transparent_26%),radial-gradient(circle_at_bottom,_rgba(94,234,212,0.12),_transparent_28%),linear-gradient(180deg,_#fffaf8_0%,_#fdfcfb_36%,_#f4fbff_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden" aria-hidden="true">
        <div className="blob blob-pink" />
        <div className="blob blob-yellow" />
        <div className="blob blob-mint" />
        <div className="grain-overlay" />
      </div>

      <Navbar user={user} isLoading={isLoading} onLogout={logout} />

      <main id="home" className="relative">
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(400px,470px)]">
            <div className="min-w-0">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-600 shadow-[0_10px_20px_rgba(244,114,182,0.08)] backdrop-blur-sm">
                  <Code2 className="h-3.5 w-3.5" />
                  Code • Learn • Compete • Grow
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="mt-6 max-w-xl text-[clamp(3rem,6vw,5.1rem)] font-black leading-[0.92] tracking-[-0.08em] text-slate-900">
                  Build a <span className="gradient-text">Brighter</span>
                  <br />
                  Tomorrow
                </h1>
              </Reveal>

              <Reveal delay={140}>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 lg:text-xl">
                  WeCode is a college coding platform built for students who want to practice with
                  purpose, compete with confidence, and grow through every challenge they solve.
                </p>
              </Reveal>

              <Reveal delay={200}>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate(user ? '/dashboard' : '/login', { replace: true })}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-orange-300 px-6 py-3.5 text-base font-semibold text-white shadow-[0_22px_35px_rgba(244,114,182,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_30px_50px_rgba(244,114,182,0.32)]"
                  >
                    Start Coding
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/problems', { replace: true })}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-6 py-3.5 text-base font-semibold text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                  >
                    Explore Problems
                  </button>
                </div>
              </Reveal>

              <Reveal delay={260}>
                <div className="mt-10 flex flex-wrap items-center gap-5 text-sm text-slate-500">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-2 shadow-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    5k+ active students
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/80 px-3 py-2 shadow-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                      <Code2 className="h-4 w-4" />
                    </div>
                    1.2k+ curated problems
                  </div>
                </div>
              </Reveal>

              <Reveal delay={320}>
                <FloatingCodeCard />
              </Reveal>
            </div>

            <Reveal className="w-full" delay={180}>
              <div className="relative mx-auto w-full max-w-[470px] py-2 lg:py-8">
                <AuthCard
                  user={user}
                  initialTab={defaultAuthTab}
                  onLogin={handleLogin}
                  onRegister={handleRegister}
                  onLogout={async () => {
                    await logout();
                    navigate('/', { replace: true });
                  }}
                />
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ProgressCard />
                  <ContestCard />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Reveal>
          <Features />
        </Reveal>
        <Reveal delay={80}>
          <WhyWeCode />
        </Reveal>
        <Reveal delay={120}>
          <CodingVisual />
        </Reveal>
        <Reveal delay={160}>
          <CTA />
        </Reveal>
      </main>

      <Footer />
    </div>
  );
};
