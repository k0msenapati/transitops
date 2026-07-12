import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('transitops_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProfile() {
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const res = await fetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (res.ok) {
          const userData = await res.json()
          setUser(userData)
        } else {
          localStorage.removeItem('transitops_token')
          setToken(null)
          setUser(null)
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [token])

  const login = async (email, password, role) => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Invalid credentials. Account locked after 5 failed attempts.')
        } else {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.detail || 'Authentication failed.')
        }
      }
      const data = await res.json()
      const accessToken = data.access_token

      const userRes = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!userRes.ok) {
        throw new Error('Failed to retrieve user profile.')
      }
      const userData = await userRes.json()
      if (userData.role !== role) {
        throw new Error(`Unauthorized: Selected role does not match your registered profile role.`)
      }

      localStorage.setItem('transitops_token', accessToken)
      setToken(accessToken)
      setUser(userData)
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('transitops_token')
    setToken(null)
    setUser(null)
    setError(null)
  }

  const registerUser = async (email, name, password, role) => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, role }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Registration failed. Email might already exist.')
      }
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, error, setError, login, logout, registerUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
