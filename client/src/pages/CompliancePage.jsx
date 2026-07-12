import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'

export default function CompliancePage() {
  const { token, user } = useAuth()
  const [filterType, setFilterType] = useState('all') // 'all', 'expired', 'low_score'

  // Enforce access control guard: safety_officer only
  const isAuthorized = user?.role === 'safety_officer'

  // Fetch Drivers for compliance verification
  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers', token],
    queryFn: async () => {
      const res = await fetch('/api/drivers', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch drivers')
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
          Only **Safety Officers** are authorized to access Compliance and Audit records.
        </p>
      </div>
    )
  }

  // Calculate compliance statistics
  const totalDrivers = drivers.length
  const today = new Date()
  
  const expiredLicenses = drivers.filter(d => new Date(d.license_expiry_date) < today)
  const lowSafetyScores = drivers.filter(d => d.safety_score < 85)
  const averageSafetyScore = totalDrivers > 0 
    ? (drivers.reduce((acc, d) => acc + d.safety_score, 0) / totalDrivers).toFixed(1)
    : '100.0'

  // Apply filters
  const filteredDrivers = drivers.filter(d => {
    if (filterType === 'expired') {
      return new Date(d.license_expiry_date) < today
    }
    if (filterType === 'low_score') {
      return d.safety_score < 85
    }
    return true
  })

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Compliance & Safety Audits</h2>
        <p className="text-sm text-zinc-400">Audit driver safety logs, license compliance, and safety scoring alerts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Active Drivers</span>
          <h3 className="text-3xl font-extrabold mt-1 text-zinc-100">{totalDrivers}</h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Average Safety Score</span>
          <h3 className="text-3xl font-extrabold mt-1 text-emerald-400">{averageSafetyScore}%</h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Expired Licenses</span>
          <h3 className={`text-3xl font-extrabold mt-1 ${expiredLicenses.length > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
            {expiredLicenses.length}
          </h3>
          {expiredLicenses.length > 0 && <div className="absolute right-3 top-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />}
        </div>
        <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-5 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">High Risk Audits</span>
          <h3 className={`text-3xl font-extrabold mt-1 ${lowSafetyScores.length > 0 ? 'text-amber-450' : 'text-zinc-400'}`}>
            {lowSafetyScores.length}
          </h3>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-zinc-850 pb-px">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
            filterType === 'all' 
              ? 'bg-zinc-900 border border-zinc-800 border-b-zinc-900 text-zinc-100' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All Drivers
        </button>
        <button
          onClick={() => setFilterType('expired')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            filterType === 'expired' 
              ? 'bg-zinc-900 border border-zinc-800 border-b-zinc-900 text-zinc-100' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          License Warnings ({expiredLicenses.length})
        </button>
        <button
          onClick={() => setFilterType('low_score')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
            filterType === 'low_score' 
              ? 'bg-zinc-900 border border-zinc-800 border-b-zinc-900 text-zinc-100' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Low Safety Score Audits ({lowSafetyScores.length})
        </button>
      </div>

      {/* Drivers List */}
      {isLoading ? (
        <div className="text-center py-20">
          <span className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin mx-auto block mb-4" />
          <p className="text-sm text-zinc-400">Loading safety records...</p>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-900 border-dashed rounded-xl p-12 text-center text-zinc-400">
          <p>No safety compliance warnings in this view.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-850/50 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Driver Name</th>
                <th className="p-4 font-semibold">License details</th>
                <th className="p-4 font-semibold">Expiry Date</th>
                <th className="p-4 font-semibold text-center">Safety Score</th>
                <th className="p-4 font-semibold">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {filteredDrivers.map((d) => {
                const isLicenseExpired = new Date(d.license_expiry_date) < today
                const isSafetyLow = d.safety_score < 85
                
                return (
                  <tr key={d.id} className="hover:bg-zinc-850/20 transition-colors">
                    <td className="p-4 font-semibold text-zinc-200">{d.name}</td>
                    <td className="p-4 font-medium text-zinc-400">
                      <span className="bg-zinc-950 border border-zinc-850 text-zinc-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mr-2">
                        {d.license_category}
                      </span>
                      {d.license_number}
                    </td>
                    <td className="p-4 text-zinc-300 font-medium">
                      <span className={isLicenseExpired ? 'text-red-400 font-bold' : ''}>
                        {d.license_expiry_date}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold">
                      <span className={isSafetyLow ? 'text-amber-450' : 'text-emerald-450'}>
                        {d.safety_score}%
                      </span>
                    </td>
                    <td className="p-4">
                      {isLicenseExpired ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-950/25 border border-red-900/50 text-red-400 rounded-full text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          License Expired
                        </span>
                      ) : isSafetyLow ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/25 border border-amber-900/50 text-amber-450 rounded-full text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Low Safety Score
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/25 border border-emerald-900/50 text-emerald-400 rounded-full text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Fully Compliant
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
