import { useEffect, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { useAuth } from '../context/AuthContext'
import { formatRole } from '../utils/format'

export default function DashboardLayout({ children }) {
  const [location, setLocation] = useLocation()
  const { token, user, loading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!token && !loading) {
      setLocation('/login')
    }
  }, [token, loading, setLocation])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-6 text-zinc-100">
        <span className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin mx-auto mb-6 block" />
        <h2 className="text-xl font-bold">Loading Platform...</h2>
      </div>
    )
  }

  if (!user) return null

  const hasAccess = (allowedRoles) => {
    return allowedRoles.includes(user.role)
  }

  const menuItems = [
    {
      name: 'Fleet Registry',
      path: '/dashboard/vehicles',
      roles: ['fleet_manager'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      )
    },
    {
      name: 'Drivers List',
      path: '/dashboard/drivers',
      roles: ['fleet_manager', 'safety_officer'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      name: 'Trips & Dispatch',
      path: '/dashboard/trips',
      roles: ['fleet_manager', 'dispatcher'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      )
    },
    {
      name: 'Maintenance Logs',
      path: '/dashboard/maintenance',
      roles: ['fleet_manager'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Top Nav */}
      <header className="md:hidden bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-black rounded" />
          </div>
          <span className="font-bold">TransitOps</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-zinc-400 hover:text-zinc-200 focus:outline-none cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex flex-col gap-3 animate-fade-in z-30">
          <div className="text-xs text-zinc-500 font-semibold mb-2 px-3">
            Logged in as: {user.name} ({formatRole(user.role)})
          </div>
          {menuItems.map((item) => {
            const authorized = hasAccess(item.roles)
            return (
              <Link key={item.path} to={authorized ? item.path : '#'}>
                <div 
                  onClick={() => authorized && setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    !authorized 
                      ? 'text-zinc-600 cursor-not-allowed opacity-50' 
                      : location.startsWith(item.path)
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200 cursor-pointer'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </div>
              </Link>
            )
          })}
          <hr className="border-zinc-800 my-2" />
          <button 
            onClick={logout}
            className="w-full py-2.5 bg-transparent border border-zinc-800 hover:bg-zinc-800 text-zinc-100 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-zinc-900 border-r border-zinc-800 p-6 h-screen sticky top-0">
        <div className="flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-black rounded" />
            </div>
            <Link to="/">
              <span className="font-bold text-lg tracking-tight cursor-pointer hover:text-zinc-300">TransitOps</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const authorized = hasAccess(item.roles)
              const active = location.startsWith(item.path)
              return (
                <Link key={item.path} to={authorized ? item.path : '#'}>
                  <div 
                    title={!authorized ? 'Unauthorized role access' : ''}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                      !authorized 
                        ? 'text-zinc-700 cursor-not-allowed opacity-40' 
                        : active
                          ? 'bg-zinc-100 text-zinc-900 shadow-md shadow-white/5'
                          : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200 cursor-pointer'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="flex flex-col gap-4 border-t border-zinc-850 pt-6">
          <div className="flex flex-col gap-1 px-2">
            <span className="text-sm font-bold text-zinc-250 truncate">{user.name}</span>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider truncate">{formatRole(user.role)}</span>
          </div>
          <button 
            onClick={logout}
            className="w-full py-2.5 bg-transparent border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-500 text-zinc-100 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Logout Console
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
