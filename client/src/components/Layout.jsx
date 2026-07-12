import { Link } from 'wouter'

export default function Layout({ children }) {
  return (
    <main className="flex min-h-screen md:h-screen w-full bg-zinc-950 text-zinc-100 md:overflow-hidden">
      {/* Left Panel: Branding & Platform Roles Scopes */}
      <section className="hidden md:flex flex-col justify-between p-12 w-[45%] bg-black border-r border-zinc-900 relative overflow-hidden h-full">
        {/* Radial blur gradients for background style */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(82,82,91,0.15)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-zinc-700 hover:rotate-6 transition-transform rounded-lg flex items-center justify-center shadow-lg shadow-zinc-800/50">
              <div className="w-4.5 h-4.5 border-2 border-black rounded" />
            </div>
            <Link to="/">
              <h1 className="text-xl font-bold tracking-tight cursor-pointer hover:text-zinc-300">TransitOps</h1>
            </Link>
          </div>
          <p className="text-xs text-zinc-500 font-medium mb-10">Smart Transport Operations Platform</p>


        </div>

        <footer className="text-[10px] text-zinc-600 tracking-widest uppercase z-10">
          TransitOps &copy; 2026
        </footer>
      </section>

      {/* Right Panel: Content injection */}
      <section className="flex-1 flex flex-col justify-center items-center p-6 md:p-10 bg-zinc-950 md:h-full md:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full my-auto">
        {children}
      </section>
    </main>
  )
}
