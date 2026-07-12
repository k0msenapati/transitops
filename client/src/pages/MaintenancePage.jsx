import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

const MOCK_VEHICLES = [
  { id: 'v1', model: 'VAN-05' },
  { id: 'v2', model: 'TRUCK-11' },
  { id: 'v3', model: 'MINI-03' },
  { id: 'v4', model: 'VAN-09' }
]

const MOCK_LOGS = [
  {
    id: 'l1',
    vehicle: 'VAN-05',
    service: 'Oil Change',
    cost: 2500,
    status: 'In Shop'
  },
  {
    id: 'l2',
    vehicle: 'TRUCK-11',
    service: 'Engine Repair',
    cost: 18000,
    status: 'Completed'
  },
  {
    id: 'l3',
    vehicle: 'MINI-03',
    service: 'Tyre Replace',
    cost: 4200,
    status: 'In Shop'
  }
]

export default function MaintenancePage() {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const [error, setError] = useState(null)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      vehicle_model: '',
      service_type: 'Oil Change',
      cost: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'In Shop'
    }
  })

  // Enforce access control guard: fleet_manager only
  const isAuthorized = user?.role === 'fleet_manager'

  // Fetch Maintenance Logs from DB
  const { data: dbLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['maintenance_logs', token],
    queryFn: async () => {
      const res = await fetch('/api/maintenance', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch maintenance logs')
      return res.json()
    },
    enabled: !!token
  })

  // Mutations
  const scheduleMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Failed to schedule maintenance.')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_logs'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      reset()
      setError(null)
      alert("Maintenance record saved successfully!")
    },
    onError: (err) => setError(err.message)
  })

  const onSubmit = (data) => {
    setError(null)
    scheduleMutation.mutate({
      vehicle_id: 1, // Mock DB link
      service_type: data.service_type,
      cost: parseFloat(data.cost || 0),
      description: `Scheduled maintenance: ${data.service_type}`,
      start_date: data.date
    })
  }

  // Combine Mock & DB logs
  const allLogs = [...MOCK_LOGS]
  dbLogs.forEach(dbL => {
    const formattedDbL = {
      id: dbL.id,
      vehicle: dbL.vehicle?.model || 'Vehicle',
      service: dbL.service_type,
      cost: dbL.cost,
      status: dbL.end_date ? 'Completed' : 'In Shop'
    }
    if (!allLogs.some(log => log.vehicle === formattedDbL.vehicle && log.service === formattedDbL.service)) {
      allLogs.push(formattedDbL)
    }
  })

  if (!isAuthorized) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center max-w-lg mx-auto mt-12 shadow-xl animate-fade-in">
        <svg className="w-12 h-12 text-zinc-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-sm text-zinc-400">
          Only operators with the **Fleet Manager** role are authorized to schedule, view, or close maintenance records.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Grid: Log Service Form (1/3) & Service Log List (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Log Service Record Form */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Log Service Record</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md flex flex-col gap-5">
            {error && (
              <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-xs text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {/* Vehicle Model Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Vehicle</label>
                <select
                  className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none cursor-pointer"
                  {...register('vehicle_model', { required: true })}
                >
                  <option value="">Select vehicle...</option>
                  {MOCK_VEHICLES.map(v => (
                    <option key={v.id} value={v.model}>{v.model}</option>
                  ))}
                </select>
              </div>

              {/* Service Type Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Service Type</label>
                <select
                  className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none cursor-pointer"
                  {...register('service_type')}
                >
                  <option value="Oil Change">Oil Change</option>
                  <option value="Engine Repair">Engine Repair</option>
                  <option value="Tyre Replace">Tyre Replace</option>
                  <option value="Brake Overhaul">Brake Overhaul</option>
                </select>
              </div>

              {/* Cost & Date Input */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Cost (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-150 focus:outline-none"
                    {...register('cost', { required: 'Cost is required', min: 0 })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-300 focus:outline-none cursor-pointer"
                    {...register('date', { required: true })}
                  />
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</label>
                <select
                  className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none cursor-pointer"
                  {...register('status')}
                >
                  <option value="In Shop">Active (In Shop)</option>
                  <option value="Completed">Resolved (Completed)</option>
                </select>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={scheduleMutation.isPending}
                className="w-full mt-2 py-2.5 bg-[#b87310] hover:bg-[#a0620c] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                {scheduleMutation.isPending ? 'Saving...' : 'Save Record'}
              </button>
            </form>

            <hr className="border-zinc-850 my-1" />

            {/* Flow Schema Diagram representation */}
            <div className="flex flex-col gap-2 bg-zinc-950/40 border border-zinc-850 rounded-lg p-4 select-none">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 text-center">Status Cycle</div>
              <div className="flex items-center justify-center gap-4">
                <span className="px-2.5 py-1 bg-emerald-950/20 border border-emerald-900/40 text-emerald-450 rounded-lg text-xs font-bold">
                  Available
                </span>
                <span className="text-zinc-500 font-black text-sm">⇌</span>
                <span className="px-2.5 py-1 bg-amber-950/20 border border-amber-900/40 text-amber-550 rounded-lg text-xs font-bold">
                  In Shop
                </span>
              </div>
            </div>

            {/* Note block */}
            <div className="text-[11px] text-amber-600 font-semibold leading-relaxed">
              Note: In Shop vehicles are removed from the dispatcher pool.
            </div>
          </div>
        </div>

        {/* Right Column: Service Log List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Service Log</h3>
          {logsLoading ? (
            <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-xl">
              <span className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin mx-auto block mb-4" />
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-850/50 border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Vehicle</th>
                    <th className="p-4 font-semibold">Service</th>
                    <th className="p-4 font-semibold text-right">Cost (INR)</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {allLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-850/10 transition-colors">
                      <td className="p-4 text-zinc-200 font-bold tracking-wide">{log.vehicle}</td>
                      <td className="p-4 text-zinc-400 font-semibold">{log.service}</td>
                      <td className="p-4 text-right text-zinc-300 font-semibold">₹{log.cost.toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${
                          log.status === 'In Shop' 
                            ? 'bg-amber-950/20 border-amber-900/40 text-amber-500'
                            : 'bg-emerald-950/25 border-emerald-900/40 text-emerald-450'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
