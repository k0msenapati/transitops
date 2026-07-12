import { Link } from 'wouter'

export default function Layout({ children }) {
  return (
    <main className="flex min-h-screen md:h-screen w-full bg-zinc-950 text-zinc-100 md:overflow-hidden">
      {/* Left Panel: Branding & Platform Roles Scopes */}
      <section className="hidden md:flex flex-col justify-between p-12 w-[45%] bg-black border-r border-zinc-900 relative overflow-hidden h-full shrink-0">
        {/* Radial blur gradients for background style */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(82,82,91,0.12)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-center my-auto max-w-lg">
          {/* Logo & Header */}
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center font-black text-white text-lg select-none shadow-lg shadow-brand/20">
              T
            </div>
            <Link to="/">
              <h1 className="text-xl font-extrabold tracking-tight cursor-pointer hover:text-zinc-200 transition-colors text-zinc-100">TransitOps</h1>
            </Link>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-100 mb-3 leading-snug">
            The Central Operating System for Modern Fleet Logistics.
          </h2>
          <p className="text-xs text-zinc-400 font-medium mb-8 leading-relaxed">
            Digitize your vehicle registries, automate dispatching validations, enforce safety compliance audits, and analyze route operating margins in real-time.
          </p>

          {/* Premium Mock Transport Monitor Card */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-5 backdrop-blur-sm relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-850/80">
              <span className="text-[9px] font-black uppercase text-brand tracking-widest bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-full">
                Active Depot
              </span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Control Center Node</span>
            </div>
            
            {/* Active Trips */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-200">TRK-11 (GJ01AB998)</span>
                  <span className="text-[10px] text-zinc-500 font-semibold">Route: Noida Depot &rarr; Delhi Depot</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-955/20 border border-emerald-900/40 text-emerald-450 text-[9px] font-bold rounded">
                  ON TRIP
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-200">VAN-05 (GJ01AB452)</span>
                  <span className="text-[10px] text-zinc-500 font-semibold">Route: Anandnagar Depot &rarr; Depot 3</span>
                </div>
                <span className="px-2 py-0.5 bg-blue-955/20 border border-blue-900/40 text-blue-400 text-[9px] font-bold rounded">
                  DISPATCHED
                </span>
              </div>
            </div>

            {/* Route Map representation */}
            <div className="mt-4 flex items-center justify-between bg-zinc-950/50 rounded-lg p-3 border border-zinc-850/60">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                <span className="text-[9px] font-extrabold uppercase text-zinc-400 tracking-wider">Source</span>
              </div>
              <div className="flex-1 border-t border-dashed border-zinc-800 mx-3 relative">
                <div className="w-1.5 h-1.5 rounded-full bg-brand absolute left-1/3 -translate-y-1/2 shadow shadow-brand" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold uppercase text-zinc-400 tracking-wider">Destination</span>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              </div>
            </div>
          </div>

          {/* Mini Stats Grid */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/20 border border-zinc-850 rounded-xl p-4">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Fleet Utilization</span>
              <span className="text-lg font-black text-brand mt-0.5 block">81.2%</span>
            </div>
            <div className="bg-zinc-900/20 border border-zinc-850 rounded-xl p-4">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Average Yield</span>
              <span className="text-lg font-black text-emerald-400 mt-0.5 block">+14.2% ROI</span>
            </div>
          </div>

        </div>

        <footer className="text-[10px] text-zinc-600 tracking-widest uppercase z-10">
          TransitOps Control &copy; 2026
        </footer>
      </section>

      {/* Right Panel: Content injection */}
      <section className="flex-1 flex flex-col justify-center items-center p-6 md:p-10 bg-zinc-950 md:h-full md:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full my-auto">
        {children}
      </section>
    </main>
  )
}
