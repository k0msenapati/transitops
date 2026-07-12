import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'

export default function AnalyticsPage() {
  const { token, user } = useAuth()
  const [search, setSearch] = useState('')

  // Enforce access control guard: financial_analyst only
  const isAuthorized = user?.role === 'financial_analyst'

  // Fetch Reports
  const { data: dbReports = [], isLoading } = useQuery({
    queryKey: ['analyticsReports', token],
    queryFn: async () => {
      const res = await fetch('/api/analytics/reports', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch analytics reports')
      return res.json()
    },
    enabled: !!token
  })

  if (!isAuthorized) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center max-w-lg mx-auto mt-12 shadow-xl animate-fade-in">
        <svg className="w-12 h-12 text-zinc-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-sm text-zinc-400">
          Only **Financial Analysts** are authorized to view fleet-wide Analytics Reports.
        </p>
      </div>
    )
  }

  // Use DB reports
  const allReports = dbReports

  const filteredReports = allReports.filter(r => 
    r.registration_number.toLowerCase().includes(search.toLowerCase()) ||
    r.model.toLowerCase().includes(search.toLowerCase())
  )

  const handleExport = async () => {
    try {
      const response = await fetch('/api/analytics/reports/export', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'fleet_roi_report.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export reports:', err)
    }
  }

  // Monthly Revenue Chart Mock Data
  const monthlyRevenue = [
    { month: 'Jan', val: 320000 },
    { month: 'Feb', val: 410000 },
    { month: 'Mar', val: 380000 },
    { month: 'Apr', val: 510000 },
    { month: 'May', val: 470000 },
    { month: 'Jun', val: 580000 },
    { month: 'Jul', val: 620000 }
  ]

  const maxVal = Math.max(...monthlyRevenue.map(m => m.val))

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-sm text-zinc-400">Review fleet financial reports, operating efficiency, and return on investment</p>
        </div>
        <button
          onClick={handleExport}
          className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-500 text-zinc-200 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats Cards Row (KPIs matching the wireframe) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Fuel Efficiency */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[110px]">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Fuel Efficiency</span>
            <h3 className="text-2xl font-black mt-1 text-zinc-100">8.4 km/L</h3>
          </div>
          <p className="text-[9px] text-zinc-500 mt-2 italic select-none">
            ROI = (Revenue - Operational Cost) / Acquisition Cost
          </p>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[110px]">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Fleet Utilization</span>
            <h3 className="text-2xl font-black mt-1 text-zinc-100">81%</h3>
          </div>
        </div>

        {/* Operational Cost */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[110px]">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Operational Cost</span>
            <h3 className="text-2xl font-black mt-1 text-amber-500">₹34,070</h3>
          </div>
        </div>

        {/* Vehicle ROI */}
        <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[110px]">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Vehicle ROI</span>
            <h3 className="text-2xl font-black mt-1 text-emerald-450">14.2%</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue Chart & Top Costliest Vehicles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Monthly Revenue Bar Chart (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Monthly Revenue</h4>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md flex flex-col justify-between h-[300px]">
            {/* Simple CSS-SVG Column bars */}
            <div className="flex-1 flex items-end justify-between gap-4 px-2">
              {monthlyRevenue.map((m, idx) => {
                const percent = (m.val / maxVal) * 100
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    {/* Tooltip value */}
                    <span className="text-[9px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 px-1 py-0.5 rounded border border-zinc-800">
                      ₹{(m.val / 1000).toFixed(0)}k
                    </span>
                    {/* Bar */}
                    <div 
                      className="w-full bg-[#b87310]/80 hover:bg-[#b87310] transition-colors rounded-t"
                      style={{ height: `${percent * 1.5}px`, maxHeight: '180px' }}
                    />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">{m.month}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top Costliest Vehicles (1/3 width) */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Top Costliest Vehicles</h4>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md flex flex-col gap-5 h-[300px] justify-center">
            {/* TRUCK-11 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-200">TRUCK-11</span>
                <span className="text-zinc-400">₹18,000</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            {/* MINI-03 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-200">MINI-03</span>
                <span className="text-zinc-400">₹4,200</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-2">
                <div className="bg-[#b87310] h-2 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            {/* VAN-05 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-200">VAN-05</span>
                <span className="text-zinc-400">₹2,500</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Report Table (optional but nice, searching fleet reports) */}
      <div className="flex flex-col gap-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Fleet Performance Detail</h4>
        <div className="relative w-full md:max-w-md mb-2">
          <svg className="absolute left-3.5 top-3 text-zinc-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search by registration number or model..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-150 placeholder-zinc-600 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-zinc-850/50 border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Vehicle</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold text-right">Distance (km)</th>
                  <th className="p-4 font-semibold text-right">Revenue (INR)</th>
                  <th className="p-4 font-semibold text-right">Expenses (INR)</th>
                  <th className="p-4 font-semibold text-right">Net Profit</th>
                  <th className="p-4 font-semibold text-right">Fuel Efficiency</th>
                  <th className="p-4 font-semibold text-right">ROI (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {filteredReports.map((r) => (
                  <tr key={r.vehicle_id} className="hover:bg-zinc-850/10 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-zinc-200">{r.registration_number}</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">{r.model}</div>
                    </td>
                    <td className="p-4 text-zinc-400">{r.type}</td>
                    <td className="p-4 text-right text-zinc-300 font-medium">{r.distance_travelled.toLocaleString()} km</td>
                    <td className="p-4 text-right text-zinc-200 font-medium">₹{r.revenue.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right text-zinc-200 font-medium">₹{r.expenses.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right font-bold">
                      <span className={r.net_profit >= 0 ? 'text-emerald-450' : 'text-red-450'}>
                        ₹{r.net_profit.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-4 text-right text-zinc-350">{r.fuel_efficiency} km/L</td>
                    <td className="p-4 text-right font-bold">
                      <span className={r.roi >= 0 ? 'text-emerald-450' : 'text-red-450'}>
                        {r.roi}%
                      </span>
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
