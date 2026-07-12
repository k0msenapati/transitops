import { useState, useEffect } from 'react'
import { Link, useLocation } from 'wouter'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { formatRole } from '../utils/format'

export default function LoginPage() {
  const [, setLocation] = useLocation()
  const { token, user, login } = useAuth()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
      role: 'fleet_manager'
    }
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const getRedirectPath = (role) => {
    switch (role) {
      case 'fleet_manager': return '/dashboard/vehicles'
      case 'dispatcher': return '/dashboard'
      case 'safety_officer': return '/dashboard/drivers'
      case 'financial_analyst': return '/dashboard/expenses'
      default: return '/dashboard'
    }
  }

  useEffect(() => {
    if (token && user) {
      setLocation(getRedirectPath(user.role))
    }
  }, [token, user, setLocation])

  const onSubmit = async (data) => {
    setError(null)
    setSubmitting(true)
    try {
      await login(data.email, data.password, data.role)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickFill = (selectedRole) => {
    const creds = {
      fleet_manager: { email: 'manager@transitops.in', pass: 'manager123' },
      dispatcher: { email: 'dispatcher@transitops.in', pass: 'dispatcher123' },
      safety_officer: { email: 'safety@transitops.in', pass: 'safety123' },
      financial_analyst: { email: 'finance@transitops.in', pass: 'finance123' },
    }
    const target = creds[selectedRole]
    if (target) {
      setValue('email', target.email)
      setValue('password', target.pass)
      setValue('role', selectedRole)
      setError(null)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-black/50 animate-fade-in my-4">
      <header className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Sign in to your account</h2>
        <p className="text-sm text-zinc-400">Enter your credentials to continue</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-950/20 border border-red-900/50 rounded-lg text-sm text-red-200" role="alert">
          <div className="font-semibold mb-1 uppercase text-xs tracking-wider">Authentication Error</div>
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {/* Email Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="email-input">Email Address</label>
          <div className="relative flex items-center">
            <svg className="absolute left-4 text-zinc-500 pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <input
              id="email-input"
              type="email"
              className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="dispatcher@transitops.in"
              {...register('email', { required: 'Email is required' })}
              disabled={submitting}
            />
          </div>
          {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="password-input">Password</label>
          <div className="relative flex items-center">
            <svg className="absolute left-4 text-zinc-500 pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input
              id="password-input"
              type="password"
              className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
              disabled={submitting}
            />
          </div>
          {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
        </div>

        {/* Role Select Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="role-select">Role (RBAC Scope)</label>
          <div className="relative flex items-center">
            <svg className="absolute left-4 text-zinc-500 pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <select
              id="role-select"
              className="w-full pl-12 pr-10 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-sm appearance-none cursor-pointer focus:outline-none focus:border-zinc-500 transition-colors"
              {...register('role', { required: true })}
              disabled={submitting}
            >
              <option value="fleet_manager">Fleet Manager</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="safety_officer">Safety Officer</option>
              <option value="financial_analyst">Financial Analyst</option>
            </select>
            <svg className="absolute right-4 text-zinc-500 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="w-full py-3 mt-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-zinc-400">Don't have an account? </span>
        <Link to="/register" className="text-zinc-100 font-semibold hover:text-zinc-300 text-decoration-none">
          Register
        </Link>
      </div>

      {/* Evaluator Quick Fill accounts */}
      <div className="mt-6 bg-zinc-950 border border-zinc-800 border-dashed rounded-lg p-3 md:p-4">
        <div className="text-[11px] font-semibold uppercase text-zinc-500 tracking-wider mb-3 flex items-center justify-between">
          <span>Evaluator Quick-Fill Accounts</span>
          <span className="text-zinc-400">Demo mode</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="bg-zinc-900 border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-850 rounded-md p-2 text-left cursor-pointer transition-colors" onClick={() => handleQuickFill('fleet_manager')} disabled={submitting}>
            <span className="text-[11px] font-semibold text-zinc-100 block">Fleet Manager</span>
            <span className="text-[9px] text-zinc-500 block truncate">manager@transitops.in</span>
          </button>
          <button type="button" className="bg-zinc-900 border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-850 rounded-md p-2 text-left cursor-pointer transition-colors" onClick={() => handleQuickFill('dispatcher')} disabled={submitting}>
            <span className="text-[11px] font-semibold text-zinc-100 block">Dispatcher</span>
            <span className="text-[9px] text-zinc-500 block truncate">dispatcher@transitops.in</span>
          </button>
          <button type="button" className="bg-zinc-900 border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-850 rounded-md p-2 text-left cursor-pointer transition-colors" onClick={() => handleQuickFill('safety_officer')} disabled={submitting}>
            <span className="text-[11px] font-semibold text-zinc-100 block">Safety Officer</span>
            <span className="text-[9px] text-zinc-500 block truncate">safety@transitops.in</span>
          </button>
          <button type="button" className="bg-zinc-900 border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-850 rounded-md p-2 text-left cursor-pointer transition-colors" onClick={() => handleQuickFill('financial_analyst')} disabled={submitting}>
            <span className="text-[11px] font-semibold text-zinc-100 block">Financial Analyst</span>
            <span className="text-[9px] text-zinc-500 block truncate">finance@transitops.in</span>
          </button>
        </div>
      </div>
    </div>
  )
}
