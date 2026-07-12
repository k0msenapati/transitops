import { Link } from 'wouter'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const { token } = useAuth()

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col justify-between selection:bg-zinc-800">
      {/* Header / Navbar */}
      <header className="border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center">
              <div className="w-4.5 h-4.5 border-2 border-black rounded" />
            </div>
            <span className="text-xl font-bold tracking-tight">TransitOps</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400 font-medium">
            <a href="#features" className="hover:text-zinc-200 transition-colors">Features</a>
            <a href="#roles" className="hover:text-zinc-200 transition-colors">Roles</a>
            <a href="#specs" className="hover:text-zinc-200 transition-colors">Specifications</a>
          </nav>

          <div>
            {token ? (
              <Link to="/dashboard">
                <button className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-lg text-sm transition-colors cursor-pointer">
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <Link to="/login">
                <button className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-lg text-sm transition-colors cursor-pointer">
                  Launch App
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="py-20 md:py-32 px-6 max-w-5xl mx-auto text-center flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-800/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full mb-6">
            v1.0.0 Live
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight max-w-4xl">
            Smart Transport Operations Platform
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed font-medium">
            Digitize your fleet registry, automate dispatch constraints, enforce driver compliance safety audits, and analyze operating costs in one unified control center.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {token ? (
              <Link to="/dashboard">
                <button className="px-8 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold rounded-lg text-base transition-colors shadow-lg shadow-white/5 cursor-pointer">
                  Enter Console
                </button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <button className="px-8 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold rounded-lg text-base transition-colors shadow-lg shadow-white/5 cursor-pointer">
                    Sign In to Account
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-8 py-4 bg-transparent border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-500 text-zinc-100 font-bold rounded-lg text-base transition-colors cursor-pointer">
                    Register Operator
                  </button>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Features / Highlights Grid */}
        <section id="features" className="py-20 border-t border-zinc-900 bg-black/20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Platform Core Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-zinc-900/50 border border-zinc-900 rounded-xl hover:border-zinc-850 hover:bg-zinc-900 transition-all group">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-300 mb-6 group-hover:bg-zinc-800 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3">Vehicle Registry</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Maintain digital vehicle listings with specifications, load capacity models, and live status.
                </p>
              </div>

              <div className="p-8 bg-zinc-900/50 border border-zinc-900 rounded-xl hover:border-zinc-850 hover:bg-zinc-900 transition-all group">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-300 mb-6 group-hover:bg-zinc-800 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3">Real-time Dispatcher</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Verify vehicle status, driver license validity, cargo weight limits, and execute automated state updates.
                </p>
              </div>

              <div className="p-8 bg-zinc-900/50 border border-zinc-900 rounded-xl hover:border-zinc-850 hover:bg-zinc-900 transition-all group">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-300 mb-6 group-hover:bg-zinc-800 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3">Analytics Engine</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Aggregate operating expenditures, log fuel usage, compute driver compliance ratings, and track ROI.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black/30 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500 uppercase tracking-widest">
          <span>TransitOps Dashboard Control</span>
          <span>&copy; 2026. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
