import { Link } from 'wouter'

export default function NotFoundPage() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md w-full shadow-2xl shadow-black/50 text-center animate-fade-in">
      <header className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight mb-2">404 - Page Not Found</h2>
        <p className="text-sm text-zinc-400">The page you are looking for does not exist.</p>
      </header>

      <p className="text-sm text-zinc-500 mb-8">
        Please check the URL or return to the landing page.
      </p>

      <Link to="/">
        <button className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-lg transition-colors cursor-pointer">
          Go to Home
        </button>
      </Link>
    </div>
  )
}
