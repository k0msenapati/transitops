import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '../context/AuthContext'
import { formatRole } from '../utils/format'

export default function DashboardPage() {
  const [, setLocation] = useLocation()
  const { token, user, loading, logout } = useAuth()

  useEffect(() => {
    if (!token && !loading) {
      setLocation('/login')
    }
  }, [token, loading, setLocation])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-6 text-zinc-100">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md w-full shadow-2xl shadow-black/50 text-center animate-fade-in">
          <span className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin mx-auto mb-6 block" />
          <h2 className="text-xl font-bold">Loading Profile...</h2>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-6 text-zinc-100 w-full">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-black/50 animate-fade-in text-center my-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-zinc-100 mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome, {user.name}!</h2>
        <p className="text-sm text-zinc-400 mb-8">You have successfully logged in to the control center dashboard.</p>

        <div className="border-t border-b border-zinc-800 py-6 mb-8 text-left flex flex-col gap-4">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 font-medium">Registered Email</span>
            <span className="text-zinc-100 font-semibold">{user.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 font-medium">Current User Role</span>
            <span className="text-zinc-300 font-semibold">{formatRole(user.role)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 font-medium">Status</span>
            <span className="text-emerald-500 font-semibold">Active</span>
          </div>
        </div>

        <button type="button" className="w-full py-3 bg-transparent border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-500 text-zinc-100 font-semibold rounded-lg transition-colors cursor-pointer" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  )
}
