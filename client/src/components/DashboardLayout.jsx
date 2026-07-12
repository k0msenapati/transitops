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
      name: 'Dashboard',
      path: '/dashboard',
      roles: ['dispatcher'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="9"></rect>
          <rect x="14" y="3" width="7" height="5"></rect>
          <rect x="14" y="12" width="7" height="9"></rect>
          <rect x="3" y="16" width="7" height="5"></rect>
        </svg>
      )
    },
    {
      name: 'Fleet',
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
      name: 'Drivers',
      path: '/dashboard/drivers',
      roles: ['safety_officer'],
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
      name: 'Trips',
      path: '/dashboard/trips',
      roles: ['dispatcher'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      )
    },
    {
      name: 'Maintenance',
      path: '/dashboard/maintenance',
      roles: ['fleet_manager'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      )
    },
    {
      name: 'Compliance',
      path: '/dashboard/compliance',
      roles: ['safety_officer'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      )
    },
    {
      name: 'Fuel & Expenses',
      path: '/dashboard/expenses',
      roles: ['financial_analyst'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      )
    },
    {
      name: 'Analytics',
      path: '/dashboard/analytics',
      roles: ['financial_analyst'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      )
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      roles: ['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
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
          {menuItems.filter(item => hasAccess(item.roles)).map((item) => {
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
            {menuItems.filter(item => hasAccess(item.roles)).map((item) => {
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

      {/* Main Content Area with Header */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between h-16 border-b border-zinc-800 px-8 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-20 w-full shrink-0">
          {/* Search bar */}
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-4 pr-4 py-2 bg-zinc-900 border border-zinc-850 rounded-lg text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          {/* User profile */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-300 font-semibold">{user.name}</span>
            <span className="text-[10px] bg-zinc-900 border border-zinc-850 text-zinc-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {formatRole(user.role)}
            </span>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-150 font-bold text-xs flex items-center justify-center shadow">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
