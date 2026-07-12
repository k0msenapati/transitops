import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('fleet_manager')
  const [rememberMe, setRememberMe] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  // Auto-login from localStorage if token exists
  useEffect(() => {
    fetch('/api')
      .then((res) => res.json())
      .then((data) => setServerMessage(data.message || JSON.stringify(data)))
      .catch((err) => setServerMessage('Failed to connect to server: ' + err.message))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Authenticate with email/password
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!loginRes.ok) {
        if (loginRes.status === 401) {
          throw new Error('Invalid credentials. Account locked after 5 failed attempts.')
        } else {
          const errData = await loginRes.json().catch(() => ({}))
          throw new Error(errData.detail || 'Authentication failed. Please try again.')
        }
      }

      const tokenData = await loginRes.json()
      const accessToken = tokenData.access_token

      // 2. Fetch User Info to verify role (RBAC Validation)
      const userRes = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!userRes.ok) {
        throw new Error('Failed to retrieve user profile.')
      }

      const userData = await userRes.json()

      // 3. Match selected role with registered role
      if (userData.role !== role) {
        throw new Error(`Unauthorized: Selected role (${role.replace('_', ' ')}) does not match your registered role.`)
      }

      // Successful login
      setToken(accessToken)
      setUser(userData)

      if (rememberMe) {
        localStorage.setItem('transitops_token', accessToken)
      } else {
        localStorage.removeItem('transitops_token')
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('transitops_token')
    setToken(null)
    setUser(null)
    setEmail('')
    setPassword('')
    setError(null)
  }

  const handleQuickFill = (selectedRole) => {
    const creds = {
      fleet_manager: { email: 'manager@transitops.in', pass: 'manager123' },
      dispatcher: { email: 'dispatcher@transitops.in', pass: 'dispatcher123' },
      safety_officer: { email: 'safety@transitops.in', pass: 'safety123' },
      financial_analyst: { email: 'finance@transitops.in', pass: 'finance123' }
    }

    const selectedCred = creds[selectedRole]
    if (selectedCred) {
      setEmail(selectedCred.email)
      setPassword(selectedCred.pass)
      setRole(selectedRole)
      setError(null)
    }
  }

  const formatRole = (r) => {
    if (!r) return ''
    return r.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <main className="auth-container">
      {/* Left Panel: Branding & Role Scopes */}
      <section className="brand-panel">
        <div className="brand-content">
          <div className="logo-container">
            <div className="logo-icon" aria-hidden="true">
              <div className="logo-inner"></div>
            </div>
            <h1 className="brand-title">TransitOps</h1>
          </div>
          <p className="brand-subtitle">Smart Transport Operations Platform</p>
        </div>

        <footer className="brand-footer">
          TransitOps &copy; 2026.
        </footer>
      </section>

      {/* Right Panel: Login / Profile details */}
      <section className="login-panel">
        {user ? (
          /* Profile Success Card */
          <div className="profile-card">
            <div className="success-badge" role="presentation">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2>Authenticated</h2>
            <p className="subtitle">Successfully signed in through Role-Based Access Control</p>

            <div className="profile-details">
              <div className="profile-row">
                <span className="label">Name</span>
                <span className="val">{user.name}</span>
              </div>
              <div className="profile-row">
                <span className="label">Email Address</span>
                <span className="val">{user.email}</span>
              </div>
              <div className="profile-row">
                <span className="label">Active Scope</span>
                <span className="val" style={{ color: 'var(--accent)' }}>{formatRole(user.role)}</span>
              </div>
            </div>

            <button type="button" className="btn-signout" onClick={handleSignOut}>
              Sign Out from Account
            </button>
          </div>
        ) : (
          /* Login Form Card */
          <div className="login-card">
            <header className="login-header">
              <h2>Sign in to your account</h2>
              <p>Enter your credentials to continue</p>
            </header>

            {error && (
              <div className="error-banner" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div className="error-body">
                  <div className="error-title">Authentication Error</div>
                  <div className="error-desc">{error}</div>
                </div>
                <button type="button" className="error-close" onClick={() => setError(null)} aria-label="Dismiss error">
                  &times;
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email Input */}
              <div className="form-group">
                <label className="form-label" htmlFor="email-input">Email Address</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    type="email"
                    id="email-input"
                    className="form-input"
                    placeholder="dispatcher@transitops.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label className="form-label" htmlFor="password-input">Password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input
                    type="password"
                    id="password-input"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Role Select Input */}
              <div className="form-group">
                <label className="form-label" htmlFor="role-select">Role (RBAC Scope)</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <select
                    id="role-select"
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                  >
                    <option value="fleet_manager">Fleet Manager</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="safety_officer">Safety Officer</option>
                    <option value="financial_analyst">Financial Analyst</option>
                  </select>
                  <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              {/* Actions & Remember Me */}
              <div className="form-actions">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" className="forgot-password" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-signin"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden="true"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Quick Fill Widget for Developers / Evaluators */}
            <div className="quick-fill-widget">
              <div className="quick-fill-header">
                <span>Evaluator Quick-Fill Accounts</span>
                <span style={{ color: 'var(--accent)' }}>Demo mode</span>
              </div>
              <div className="quick-fill-grid">
                <button
                  type="button"
                  className="btn-quick-fill"
                  onClick={() => handleQuickFill('fleet_manager')}
                  disabled={loading}
                >
                  <span className="role-name">Fleet Manager</span>
                  <span className="role-email">manager@transitops.in</span>
                </button>
                <button
                  type="button"
                  className="btn-quick-fill"
                  onClick={() => handleQuickFill('dispatcher')}
                  disabled={loading}
                >
                  <span className="role-name">Dispatcher</span>
                  <span className="role-email">dispatcher@transitops.in</span>
                </button>
                <button
                  type="button"
                  className="btn-quick-fill"
                  onClick={() => handleQuickFill('safety_officer')}
                  disabled={loading}
                >
                  <span className="role-name">Safety Officer</span>
                  <span className="role-email">safety@transitops.in</span>
                </button>
                <button
                  type="button"
                  className="btn-quick-fill"
                  onClick={() => handleQuickFill('financial_analyst')}
                  disabled={loading}
                >
                  <span className="role-name">Financial Analyst</span>
                  <span className="role-email">finance@transitops.in</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
