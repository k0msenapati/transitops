import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '../context/AuthContext'
import { formatRole } from '../utils/format'

export default function DashboardPage() {
  const [, setLocation] = useLocation()
  const { token, user, loading } = useAuth()

  useEffect(() => {
    if (!token && !loading) {
      setLocation('/login')
    }
  }, [token, loading, setLocation])

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 text-center animate-fade-in max-w-md mx-auto">
        <span className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin mx-auto mb-6 block" />
        <h2 className="text-xl font-bold">Loading Profile...</h2>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 max-w-xl shadow-xl shadow-black/30 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 text-zinc-100">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Welcome, {user.name}!</h2>
          <p className="text-xs text-zinc-400">TransitOps Control Console Operator Profile</p>
        </div>
      </div>

      <div className="border-t border-zinc-800 py-5 flex flex-col gap-4">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 font-medium">Operator Name</span>
          <span className="text-zinc-200 font-semibold">{user.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 font-medium">Registered Email</span>
          <span className="text-zinc-200 font-semibold">{user.email}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 font-medium">Active RBAC Role</span>
          <span className="text-zinc-200 font-semibold" style={{ color: 'var(--accent)' }}>
            {formatRole(user.role)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 font-medium">System Status</span>
          <span className="text-emerald-500 font-semibold">Active</span>
        </div>
      </div>
    </div>
  )
}
