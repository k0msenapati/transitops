import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { formatRole } from '../utils/format'

export default function SettingsPage() {
  const { user } = useAuth()
  
  const [depotName, setDepotName] = useState('Anandnagar Depot ASTD')
  const [currency, setCurrency] = useState('INR (₹)')
  const [distanceUnit, setDistanceUnit] = useState('Kilometers')
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem('transitops-theme') || 'teal')

  const handleSave = (e) => {
    e.preventDefault()
    localStorage.setItem('transitops-theme', themeColor)
    document.documentElement.setAttribute('data-theme', themeColor)
    alert('General settings saved successfully!')
  }

  // RBAC Table matrix definition representing our strict permission scopes
  const rbacMatrix = [
    {
      role: 'Fleet Manager',
      fleet: true,
      drivers: false,
      trips: false,
      maintenance: true,
      compliance: false,
      fuel_expenses: false,
      analytics: false
    },
    {
      role: 'Dispatcher',
      fleet: false,
      drivers: false,
      trips: true,
      maintenance: false,
      compliance: false,
      fuel_expenses: false,
      analytics: false
    },
    {
      role: 'Safety Officer',
      fleet: false,
      drivers: true,
      trips: false,
      maintenance: false,
      compliance: true,
      fuel_expenses: false,
      analytics: false
    },
    {
      role: 'Financial Analyst',
      fleet: false,
      drivers: false,
      trips: false,
      maintenance: false,
      compliance: false,
      fuel_expenses: true,
      analytics: true
    }
  ]

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Settings & RBAC</h2>
        <p className="text-sm text-zinc-400">Configure global operator settings and review security role-based permissions matrix</p>
      </div>

      {/* Grid: General Settings (1/3) & RBAC Matrix (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: General Configuration */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">General</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md">
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              
              {/* Depot Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Depot Name</label>
                <input
                  type="text"
                  value={depotName}
                  onChange={(e) => setDepotName(e.target.value)}
                  className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-150 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              {/* Currency Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>

              {/* Distance Unit Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Distance Unit</label>
                <select
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value)}
                  className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option>Kilometers</option>
                  <option>Miles</option>
                </select>
              </div>

              {/* Theme Color Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Theme Color</label>
                <select
                  value={themeColor}
                  onChange={(e) => {
                    setThemeColor(e.target.value)
                    localStorage.setItem('transitops-theme', e.target.value)
                    document.documentElement.setAttribute('data-theme', e.target.value)
                  }}
                  className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option value="teal">Teal (Default)</option>
                  <option value="green">Green</option>
                  <option value="blue">Blue</option>
                  <option value="yellow">Yellow</option>
                  <option value="purple">Purple</option>
                </select>
              </div>

              {/* Save changes button */}
              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-[#b87310] hover:bg-[#a0620c] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Save changes
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: RBAC Matrix */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Role-Based Access (RBAC)</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-850/50 border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold text-center">Fleet</th>
                  <th className="p-4 font-semibold text-center">Drivers</th>
                  <th className="p-4 font-semibold text-center">Trips</th>
                  <th className="p-4 font-semibold text-center">Maint.</th>
                  <th className="p-4 font-semibold text-center">Compl.</th>
                  <th className="p-4 font-semibold text-center">Fuel/Exp.</th>
                  <th className="p-4 font-semibold text-center">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {rbacMatrix.map((r, idx) => (
                  <tr key={idx} className="hover:bg-zinc-850/10 transition-colors">
                    <td className="p-4 text-zinc-200 font-bold">{r.role}</td>
                    
                    {/* Fleet */}
                    <td className="p-4 text-center">
                      {r.fleet ? (
                        <span className="text-emerald-450 font-black text-sm">✓</span>
                      ) : (
                        <span className="text-zinc-650">—</span>
                      )}
                    </td>

                    {/* Drivers */}
                    <td className="p-4 text-center">
                      {r.drivers ? (
                        <span className="text-emerald-450 font-black text-sm">✓</span>
                      ) : (
                        <span className="text-zinc-650">—</span>
                      )}
                    </td>

                    {/* Trips */}
                    <td className="p-4 text-center">
                      {r.trips ? (
                        <span className="text-emerald-450 font-black text-sm">✓</span>
                      ) : (
                        <span className="text-zinc-650">—</span>
                      )}
                    </td>

                    {/* Maintenance */}
                    <td className="p-4 text-center">
                      {r.maintenance ? (
                        <span className="text-emerald-450 font-black text-sm">✓</span>
                      ) : (
                        <span className="text-zinc-650">—</span>
                      )}
                    </td>

                    {/* Compliance */}
                    <td className="p-4 text-center">
                      {r.compliance ? (
                        <span className="text-emerald-450 font-black text-sm">✓</span>
                      ) : (
                        <span className="text-zinc-650">—</span>
                      )}
                    </td>

                    {/* Fuel / Exp */}
                    <td className="p-4 text-center">
                      {r.fuel_expenses ? (
                        <span className="text-emerald-450 font-black text-sm">✓</span>
                      ) : (
                        <span className="text-zinc-650">—</span>
                      )}
                    </td>

                    {/* Analytics */}
                    <td className="p-4 text-center">
                      {r.analytics ? (
                        <span className="text-emerald-450 font-black text-sm">✓</span>
                      ) : (
                        <span className="text-zinc-650">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
