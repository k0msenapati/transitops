import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

export default function MaintenancePage() {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()

  // Modal controls
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [closeModalOpen, setCloseModalOpen] = useState(false)
  const [activeLog, setActiveLog] = useState(null)

  const scheduleForm = useForm()
  const closeForm = useForm()

  const [error, setError] = useState(null)

  // Enforce access control guard: fleet_manager only
  const isAuthorized = user?.role === 'fleet_manager'

  // 1. Fetch Maintenance Logs
  const { data: logs = [], isLoading: logsLoading } = useQuery({
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

  // 2. Fetch Vehicles (for dropdown selection)
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', token],
    queryFn: async () => {
      const res = await fetch('/api/vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch vehicles')
      return res.json()
    },
    enabled: !!token && scheduleModalOpen
  })

  // Filter available vehicles for service assignment
  const availableVehicles = vehicles.filter(v => v.status === 'Available')

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
      setScheduleModalOpen(false)
      scheduleForm.reset()
      setError(null)
    },
    onError: (err) => setError(err.message)
  })

  const closeMutation = useMutation({
    mutationFn: async ({ logId, body }) => {
      const res = await fetch(`/api/maintenance/${logId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Failed to resolve maintenance log.')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_logs'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      setCloseModalOpen(false)
      closeForm.reset()
      setError(null)
    },
    onError: (err) => setError(err.message)
  })

  const onScheduleSubmit = (data) => {
    setError(null)
    scheduleMutation.mutate({
      ...data,
      vehicle_id: parseInt(data.vehicle_id),
      cost: parseFloat(data.cost || 0)
    })
  }

  const onCloseSubmit = (data) => {
    setError(null)
    closeMutation.mutate({
      logId: activeLog.id,
      body: {
        end_date: data.end_date,
        cost: parseFloat(data.cost || activeLog.cost)
      }
    })
  }

  const openCloseModal = (log) => {
    setActiveLog(log)
    setCloseModalOpen(true)
    // Pre-populate end date with today and cost with initial cost
    closeForm.setValue('end_date', new Date().toISOString().split('T')[0])
    closeForm.setValue('cost', log.cost)
  }

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
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Maintenance Service Logs</h2>
          <p className="text-sm text-zinc-400">Log repairs, track shop status, and monitor servicing cost ROI</p>
        </div>
        <button 
          onClick={() => setScheduleModalOpen(true)}
          className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Schedule Service
        </button>
      </div>

      {/* Grid listing */}
      {logsLoading ? (
        <div className="text-center py-20">
          <span className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin mx-auto block mb-4" />
          <p className="text-sm text-zinc-400">Loading service logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-900 border-dashed rounded-xl p-12 text-center text-zinc-400">
          <p className="mb-2">No maintenance records logged in the database.</p>
          <button 
            onClick={() => setScheduleModalOpen(true)}
            className="text-zinc-100 font-semibold underline hover:text-zinc-300 cursor-pointer"
          >
            Log your first vehicle service
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-xs font-semibold uppercase">
                  <th className="px-6 py-4">Vehicle ID</th>
                  <th className="px-6 py-4">Service Description</th>
                  <th className="px-6 py-4">Start Date</th>
                  <th className="px-6 py-4">Resolve Date</th>
                  <th className="px-6 py-4 text-center">Cost (₹)</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-850/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-100">
                      Vehicle #{log.vehicle_id}
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-medium">{log.description}</td>
                    <td className="px-6 py-4 text-xs text-zinc-400">{log.start_date}</td>
                    <td className="px-6 py-4 text-xs text-zinc-400">{log.end_date || 'In Progress'}</td>
                    <td className="px-6 py-4 text-center font-semibold text-zinc-300">
                      ₹{log.cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                        log.status === 'Active' 
                          ? 'bg-amber-950 text-amber-400 border border-amber-900' 
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status === 'Active' && (
                        <button 
                          onClick={() => openCloseModal(log)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 hover:text-zinc-100 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors cursor-pointer"
                        >
                          Close Service
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1. Schedule Maintenance Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center p-6 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Schedule Service</h3>
              <button 
                onClick={() => { setScheduleModalOpen(false); scheduleForm.reset(); setError(null); }}
                className="text-zinc-400 hover:text-zinc-200 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-xs text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)} className="flex flex-col gap-4">
              {/* Vehicle selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Select Vehicle (Available)</label>
                <div className="relative flex items-center">
                  <select 
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs appearance-none cursor-pointer focus:outline-none focus:border-zinc-500"
                    {...scheduleForm.register('vehicle_id', { required: 'Vehicle selection is required' })}
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {availableVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.model} ({v.registration_number})
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3 text-zinc-500 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {availableVehicles.length === 0 && <span className="text-[10px] text-amber-500">No active vehicles are currently Available.</span>}
              </div>

              {/* Service description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Service Description</label>
                <input 
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500"
                  placeholder="Engine Overhaul, Oil Change, Tyre Alignment"
                  {...scheduleForm.register('description', { required: 'Description is required' })}
                />
                {scheduleForm.formState.errors.description && <span className="text-red-500 text-[10px]">{scheduleForm.formState.errors.description.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Initial Cost Estimate (₹)</label>
                  <input 
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="4500"
                    {...scheduleForm.register('cost')}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Start Date</label>
                  <input 
                    type="date"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-zinc-500"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    {...scheduleForm.register('start_date', { required: 'Start date is required' })}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 mt-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                disabled={scheduleMutation.isPending}
              >
                {scheduleMutation.isPending ? 'Logging Service...' : 'Commit Vehicle to Shop'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Close Maintenance Modal */}
      {closeModalOpen && activeLog && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center p-6 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Resolve Service Log</h3>
              <button 
                onClick={() => { setCloseModalOpen(false); closeForm.reset(); setError(null); }}
                className="text-zinc-400 hover:text-zinc-200 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-xs text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={closeForm.handleSubmit(onCloseSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Total Actual Cost (₹)</label>
                <input 
                  type="number"
                  step="any"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-zinc-500"
                  placeholder={activeLog.cost}
                  {...closeForm.register('cost')}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Resolve Date</label>
                <input 
                  type="date"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-zinc-500"
                  {...closeForm.register('end_date', { required: 'Resolve date is required' })}
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 mt-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                disabled={closeMutation.isPending}
              >
                {closeMutation.isPending ? 'Resolving Log...' : 'Close Service Log & Return Vehicle'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
