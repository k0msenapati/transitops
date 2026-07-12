import { useState, useEffect } from 'react'
import { Link, useLocation } from 'wouter'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [, setLocation] = useLocation()
  const { token, registerUser } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (token) setLocation('/dashboard')
  }, [token, setLocation])

  const onSubmit = async (data) => {
    setError(null)
    setSubmitting(true)
    try {
      await registerUser(data.email, data.name, data.password, data.role)
      setLocation('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-black/50 animate-fade-in my-4">
      <header className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Create Account</h2>
        <p className="text-sm text-zinc-400">Register a new operator profile</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-950/20 border border-red-900/50 rounded-lg text-sm text-red-200" role="alert">
          <div className="font-semibold mb-1 uppercase text-xs tracking-wider">Registration Error</div>
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {/* Name Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="reg-name">Full Name</label>
          <input
            id="reg-name"
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
            placeholder="John Doe"
            {...register('name', { required: 'Name is required' })}
            disabled={submitting}
          />
          {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
        </div>

        {/* Email Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="reg-email">Email Address</label>
          <input
            id="reg-email"
            type="email"
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
            placeholder="operator@transitops.com"
            {...register('email', { 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
            })}
            disabled={submitting}
          />
          {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="reg-pass">Password</label>
          <input
            id="reg-pass"
            type="password"
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
            placeholder="••••••••"
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 4, message: 'Password must be at least 4 characters' }
            })}
            disabled={submitting}
          />
          {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
        </div>

        {/* Role Select Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="reg-role">Role (RBAC Assignment)</label>
          <div className="relative flex items-center">
            <select
              id="reg-role"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-sm appearance-none cursor-pointer focus:outline-none focus:border-zinc-500 transition-colors"
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

        <button type="submit" className="w-full py-3 mt-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitting}>
          {submitting ? 'Registering...' : 'Register Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-zinc-400">Already have an account? </span>
        <Link to="/login" className="text-zinc-100 font-semibold hover:text-zinc-300 text-decoration-none">
          Sign In
        </Link>
      </div>
    </div>
  )
}
