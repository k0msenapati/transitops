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

  const isAuthorized = user.role === 'dispatcher'

  if (!isAuthorized) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center max-w-lg mx-auto mt-12 shadow-xl animate-fade-in">
        <svg className="w-12 h-12 text-zinc-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-sm text-zinc-400">
          Only operators with the **Dispatcher** role are authorized to access the Dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Filters</span>
          <div className="flex gap-3">
            <select className="bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-350 focus:outline-none cursor-pointer focus:border-zinc-500 transition-colors">
              <option>Vehicle Type: All</option>
              <option>Van</option>
              <option>Truck</option>
              <option>Mini</option>
            </select>
            <select className="bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-350 focus:outline-none cursor-pointer focus:border-zinc-500 transition-colors">
              <option>Status: All</option>
              <option>Available</option>
              <option>On Trip</option>
              <option>In Maintenance</option>
            </select>
            <select className="bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-350 focus:outline-none cursor-pointer focus:border-zinc-500 transition-colors">
              <option>Region: All</option>
              <option>Ahmedabad</option>
              <option>Noida</option>
              <option>Manesar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Row (7 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-zinc-900 border-l-2 border-l-blue-500 border-y border-r border-zinc-800 rounded-lg p-4">
          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Active Vehicles</span>
          <span className="text-2xl font-black text-zinc-100 mt-1 block">53</span>
        </div>
        <div className="bg-zinc-900 border-l-2 border-l-emerald-500 border-y border-r border-zinc-800 rounded-lg p-4">
          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Available Vehicles</span>
          <span className="text-2xl font-black text-zinc-100 mt-1 block">42</span>
        </div>
        <div className="bg-zinc-900 border-l-2 border-l-amber-500 border-y border-r border-zinc-800 rounded-lg p-4">
          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Vehicles in Maint.</span>
          <span className="text-2xl font-black text-zinc-100 mt-1 block">05</span>
        </div>
        <div className="bg-zinc-900 border-l-2 border-l-blue-500 border-y border-r border-zinc-800 rounded-lg p-4">
          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Active Trips</span>
          <span className="text-2xl font-black text-zinc-100 mt-1 block">18</span>
        </div>
        <div className="bg-zinc-900 border-l-2 border-l-indigo-400 border-y border-r border-zinc-800 rounded-lg p-4">
          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Pending Trips</span>
          <span className="text-2xl font-black text-zinc-100 mt-1 block">09</span>
        </div>
        <div className="bg-zinc-900 border-l-2 border-l-blue-500 border-y border-r border-zinc-800 rounded-lg p-4">
          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Drivers on Duty</span>
          <span className="text-2xl font-black text-zinc-100 mt-1 block">26</span>
        </div>
        <div className="bg-zinc-900 border-l-2 border-l-emerald-500 border-y border-r border-zinc-800 rounded-lg p-4">
          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Fleet Utilization</span>
          <span className="text-2xl font-black text-emerald-450 mt-1 block">81%</span>
        </div>
      </div>

      {/* Main Grid: Recent Trips & Vehicle Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Recent Trips Table (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Recent Trips</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-850/50 border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Trip</th>
                  <th className="p-4 font-semibold">Vehicle</th>
                  <th className="p-4 font-semibold">Driver</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                <tr className="hover:bg-zinc-850/10 transition-colors">
                  <td className="p-4 text-zinc-200 font-bold">TR001</td>
                  <td className="p-4 text-zinc-450 font-semibold">VAN-05</td>
                  <td className="p-4 text-zinc-350 italic">Alex</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-950/20 border border-blue-900/40 text-blue-400 rounded-full text-xs font-semibold">
                      On Trip
                    </span>
                  </td>
                  <td className="p-4 text-zinc-400 font-semibold">45 min</td>
                </tr>
                <tr className="hover:bg-zinc-850/10 transition-colors">
                  <td className="p-4 text-zinc-200 font-bold">TR002</td>
                  <td className="p-4 text-zinc-450 font-semibold">TRK-12</td>
                  <td className="p-4 text-zinc-350 italic">John</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-950/25 border border-emerald-900/40 text-emerald-450 rounded-full text-xs font-semibold">
                      Completed
                    </span>
                  </td>
                  <td className="p-4 text-zinc-500 font-medium">—</td>
                </tr>
                <tr className="hover:bg-zinc-850/10 transition-colors">
                  <td className="p-4 text-zinc-200 font-bold">TR003</td>
                  <td className="p-4 text-zinc-450 font-semibold">MINI-08</td>
                  <td className="p-4 text-zinc-350 italic">Priya</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-zinc-950 border border-blue-900/50 text-blue-400 rounded-full text-xs font-semibold">
                      Dispatched
                    </span>
                  </td>
                  <td className="p-4 text-zinc-400 font-semibold">1h 10m</td>
                </tr>
                <tr className="hover:bg-zinc-850/10 transition-colors">
                  <td className="p-4 text-zinc-200 font-bold">TR004</td>
                  <td className="p-4 text-zinc-500 font-medium">—</td>
                  <td className="p-4 text-zinc-500 font-medium">—</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-zinc-850 border border-zinc-800 text-zinc-450 rounded-full text-xs font-semibold">
                      Draft
                    </span>
                  </td>
                  <td className="p-4 text-zinc-450 italic text-xs">Awaiting vehicle</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status Progress bars (1/3 width) */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Vehicle Status</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md flex flex-col gap-5">
            {/* Available */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-450">Available</span>
                <span className="text-zinc-200">60%</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
            
            {/* On Trip */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-450">On Trip</span>
                <span className="text-zinc-200">30%</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }} />
              </div>
            </div>

            {/* In Shop */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-450">In Shop</span>
                <span className="text-zinc-200">10%</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>

            {/* Retired */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-450">Retired</span>
                <span className="text-zinc-200">5%</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
