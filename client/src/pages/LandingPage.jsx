import { Link } from 'wouter'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const { token } = useAuth()

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col justify-between selection:bg-zinc-800 relative overflow-hidden">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-800/15 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#b87310]/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }} />

      {/* Header / Navbar */}
      <header className="border-b border-zinc-900 bg-black/40 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center shadow-lg group-hover:border-zinc-500 group-hover:scale-105 transition-all duration-300">
              <div className="w-4 h-4 border-2 border-[#b87310] rounded" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-350 bg-clip-text text-transparent group-hover:from-white group-hover:to-zinc-200 transition-colors">
              TransitOps
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-zinc-450">
            <a href="#features" className="hover:text-zinc-200 transition-colors duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-zinc-200 hover:after:w-full after:transition-all after:duration-300">Features</a>
            <a href="#roles" className="hover:text-zinc-200 transition-colors duration-200 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-zinc-200 hover:after:w-full after:transition-all after:duration-300">Operations Scopes</a>
          </nav>

          <div>
            {token ? (
              <Link to="/dashboard">
                <button className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 font-bold rounded-lg text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer shadow-md shadow-white/5">
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <Link to="/login">
                <button className="px-5 py-2.5 bg-[#b87310] hover:bg-[#a0620c] text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer shadow-md shadow-amber-950/20">
                  Launch Console
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="py-24 md:py-36 px-6 max-w-5xl mx-auto text-center flex flex-col items-center relative z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-900/5 rounded-full blur-[150px] pointer-events-none -z-10" />

          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#b87310] bg-[#b87310]/10 border border-[#b87310]/30 px-3.5 py-1 rounded-full mb-6">
            Logistics Control v1.0.0
          </span>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-[1.1] max-w-4xl bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Smart Transport Operations Platform
          </h1>
          
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mb-12 leading-relaxed font-medium">
            Digitize your fleet registry, automate dispatch constraints, enforce driver compliance safety audits, and analyze operating costs in one unified control center.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {token ? (
              <Link to="/dashboard">
                <button className="px-8 py-4 bg-zinc-100 hover:bg-white text-zinc-900 font-bold rounded-lg text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5 cursor-pointer">
                  Enter Console
                </button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <button className="px-8 py-4 bg-zinc-100 hover:bg-white text-zinc-900 font-bold rounded-lg text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5 cursor-pointer">
                    Sign In to Account
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-8 py-4 bg-transparent border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-500 text-zinc-150 font-bold rounded-lg text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                    Register Operator
                  </button>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 border-t border-zinc-900 bg-black/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-100">Platform Core Modules</h2>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mt-2">Core system functionalities</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 bg-zinc-900/40 border border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/60 rounded-xl hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-black/50 group">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center text-[#b87310] mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3 text-zinc-200">Vehicle Registry</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Maintain digital vehicle listings with specifications, load capacity models, and live status.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 bg-zinc-900/40 border border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/60 rounded-xl hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-black/50 group">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3 text-zinc-200">Real-time Dispatcher</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Verify vehicle status, driver license validity, cargo weight limits, and execute automated state updates.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 bg-zinc-900/40 border border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/60 rounded-xl hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-black/50 group">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-3 text-zinc-200">Analytics Engine</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Aggregate operating expenditures, log fuel usage, compute driver compliance ratings, and track ROI.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section id="roles" className="py-24 border-t border-zinc-900 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-100">Role-Based Workspaces</h2>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mt-2">Workflows customized by operator scope</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Role 1 */}
              <div className="p-6 bg-zinc-900/35 border-y border-x border-zinc-850 hover:border-amber-500/40 hover:bg-zinc-900/60 rounded-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                <span className="bg-amber-955/20 border border-amber-900/45 text-amber-500 text-[9px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider inline-block mb-4">
                  Fleet Manager
                </span>
                <h4 className="text-sm font-bold text-zinc-200 mb-2">Fleet & Maintenance</h4>
                <p className="text-zinc-450 text-xs leading-relaxed">
                  Full control over vehicle listings, specification modeling, service scheduler, and shop cost-accounting logs.
                </p>
              </div>

              {/* Role 2 */}
              <div className="p-6 bg-zinc-900/35 border-y border-x border-zinc-850 hover:border-blue-500/40 hover:bg-zinc-900/60 rounded-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                <span className="bg-blue-955/20 border border-blue-900/45 text-blue-500 text-[9px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider inline-block mb-4">
                  Dispatcher
                </span>
                <h4 className="text-sm font-bold text-zinc-200 mb-2">Dashboard & Trips</h4>
                <p className="text-zinc-455 text-xs leading-relaxed">
                  Plan routes, match drivers, track cargo weight constraints dynamically, and monitor the live dispatch board.
                </p>
              </div>

              {/* Role 3 */}
              <div className="p-6 bg-zinc-900/35 border-y border-x border-zinc-850 hover:border-emerald-500/40 hover:bg-zinc-900/60 rounded-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <span className="bg-emerald-955/20 border border-emerald-900/45 text-emerald-450 text-[9px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider inline-block mb-4">
                  Safety Officer
                </span>
                <h4 className="text-sm font-bold text-zinc-200 mb-2">Drivers & Compliance</h4>
                <p className="text-zinc-455 text-xs leading-relaxed">
                  Monitor safety ratings, track license expiration warning flags, execute compliance audits, and manage suspensions.
                </p>
              </div>

              {/* Role 4 */}
              <div className="p-6 bg-zinc-900/35 border-y border-x border-zinc-850 hover:border-violet-500/40 hover:bg-zinc-900/60 rounded-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
                <span className="bg-violet-955/20 border border-violet-900/45 text-violet-400 text-[9px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider inline-block mb-4">
                  Financial Analyst
                </span>
                <h4 className="text-sm font-bold text-zinc-200 mb-2">Expenses & Analytics</h4>
                <p className="text-zinc-455 text-xs leading-relaxed">
                  Log fuel ledger data, analyze toll expenditures, calculate vehicle ROI rates, and export CSV reports.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black/30 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-550 uppercase tracking-widest select-none">
          <span>TransitOps Dashboard Control</span>
          <span>&copy; 2026. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}
