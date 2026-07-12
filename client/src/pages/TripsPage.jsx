import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

export default function TripsPage() {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [completeModalOpen, setCompleteModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [activeTripId, setActiveTripId] = useState(null)

  const createForm = useForm()
  const completeForm = useForm()
  const cancelForm = useForm()

  const [error, setError] = useState(null)

  const isAuthorized = ['fleet_manager', 'dispatcher'].includes(user?.role)

  // 1. Fetch Trips (Live Board list)
  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ['trips', token],
    queryFn: async () => {
      const res = await fetch('/api/trips/live', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch trips')
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
    enabled: !!token && createModalOpen
  })

  // 3. Fetch Drivers (for dropdown selection)
  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers', token],
    queryFn: async () => {
      const res = await fetch('/api/drivers', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch drivers')
      return res.json()
    },
    enabled: !!token && createModalOpen
  })

  // Filter available resources for dispatch assignment
  const availableVehicles = vehicles.filter(v => v.status === 'Available')
  const availableDrivers = drivers.filter(d => d.status === 'Available')

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Failed to create trip.')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      setCreateModalOpen(false)
      createForm.reset()
      setError(null)
    },
    onError: (err) => setError(err.message)
  })

  const dispatchMutation = useMutation({
    mutationFn: async (tripId) => {
      const res = await fetch(`/api/trips/${tripId}/dispatch`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Dispatch failed.')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      setError(null)
    },
    onError: (err) => alert(err.message)
  })

  const completeMutation = useMutation({
    mutationFn: async ({ tripId, body }) => {
      const res = await fetch(`/api/trips/${tripId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Trip completion failed.')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      setCompleteModalOpen(false)
      completeForm.reset()
      setError(null)
    },
    onError: (err) => setError(err.message)
  })

  const cancelMutation = useMutation({
    mutationFn: async ({ tripId, body }) => {
      const res = await fetch(`/api/trips/${tripId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Cancellation failed.')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      setCancelModalOpen(false)
      cancelForm.reset()
      setError(null)
    },
    onError: (err) => setError(err.message)
  })

  const onCreateSubmit = (data) => {
    setError(null)
    createMutation.mutate({
      ...data,
      vehicle_id: parseInt(data.vehicle_id),
      driver_id: parseInt(data.driver_id),
      cargo_weight: parseFloat(data.cargo_weight),
      planned_distance: parseFloat(data.planned_distance),
      eta_minutes: data.eta_minutes ? parseInt(data.eta_minutes) : null,
      revenue: parseFloat(data.revenue || 0)
    })
  }

  const onCompleteSubmit = (data) => {
    setError(null)
    completeMutation.mutate({
      tripId: activeTripId,
      body: {
        final_odometer: parseFloat(data.final_odometer),
        fuel_liters: parseFloat(data.fuel_liters),
        fuel_cost: parseFloat(data.fuel_cost),
        revenue: data.revenue ? parseFloat(data.revenue) : null
      }
    })
  }

  const onCancelSubmit = (data) => {
    setError(null)
    cancelMutation.mutate({
      tripId: activeTripId,
      body: {
        notes: data.notes
      }
    })
  }

  if (!isAuthorized) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center max-w-lg mx-auto mt-12 shadow-xl">
        <svg className="w-12 h-12 text-zinc-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-sm text-zinc-400">
          Only **Fleet Managers** and **Dispatchers** are authorized to manage or access the Live Dispatch Board.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Dispatch Board</h2>
          <p className="text-sm text-zinc-400">Plan routes, assign resources, and monitor trip lifecycles</p>
        </div>
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Create Trip
        </button>
      </div>

      {/* Trips list */}
      {tripsLoading ? (
        <div className="text-center py-20">
          <span className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin mx-auto block mb-4" />
          <p className="text-sm text-zinc-400">Loading active dispatch board...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-900 border-dashed rounded-xl p-12 text-center text-zinc-400">
          <p className="mb-2">No active or scheduled trips registered.</p>
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="text-zinc-100 font-semibold underline hover:text-zinc-300 cursor-pointer"
          >
            Schedule your first trip
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {trips.map((t) => (
            <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-zinc-700 transition-colors">
              <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                    t.status === 'Draft' 
                      ? 'bg-zinc-950 text-zinc-400 border border-zinc-800' 
                      : t.status === 'Dispatched'
                        ? 'bg-blue-950 text-blue-400 border border-blue-900'
                        : t.status === 'Completed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                          : 'bg-red-950 text-red-400 border border-red-900'
                  }`}>
                    {t.status}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">Trip #{t.id}</span>
                </div>
                <h4 className="text-base font-bold text-zinc-100 mt-1">
                  {t.source} &rarr; {t.destination}
                </h4>
                <p className="text-xs text-zinc-400">
                  Assigned Vehicle: <span className="text-zinc-250 font-medium">{t.vehicle?.model} ({t.vehicle?.registration_number})</span> | Driver: <span className="text-zinc-250 font-medium">{t.driver?.name}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-left min-w-[280px]">
                <div>
                  <span className="text-zinc-500 block mb-0.5">Cargo Weight</span>
                  <span className="font-semibold text-zinc-300">{t.cargo_weight.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Planned Dist.</span>
                  <span className="font-semibold text-zinc-300">{t.planned_distance.toLocaleString()} km</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">ETA</span>
                  <span className="font-semibold text-zinc-300">{t.eta_minutes ? `${t.eta_minutes} mins` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Revenue</span>
                  <span className="font-semibold text-zinc-300">₹{t.revenue.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {t.status === 'Draft' && (
                  <button 
                    onClick={() => dispatchMutation.mutate(t.id)}
                    className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Dispatch
                  </button>
                )}
                {t.status === 'Dispatched' && (
                  <button 
                    onClick={() => { setActiveTripId(t.id); setCompleteModalOpen(true); }}
                    className="px-3.5 py-2 bg-emerald-950 border border-emerald-900 hover:bg-emerald-900 text-emerald-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Complete
                  </button>
                )}
                {(t.status === 'Draft' || t.status === 'Dispatched') && (
                  <button 
                    onClick={() => { setActiveTripId(t.id); setCancelModalOpen(true); }}
                    className="px-3.5 py-2 bg-transparent border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1. Create Trip Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center p-6 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Schedule Trip</h3>
              <button 
                onClick={() => { setCreateModalOpen(false); createForm.reset(); setError(null); }}
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

            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Source Depot</label>
                  <input 
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="Delhi Depot A"
                    {...createForm.register('source', { required: 'Source is required' })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Destination</label>
                  <input 
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="Mumbai Depot B"
                    {...createForm.register('destination', { required: 'Destination is required' })}
                  />
                </div>
              </div>

              {/* Vehicle Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Select Vehicle (Available)</label>
                <div className="relative flex items-center">
                  <select 
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs appearance-none cursor-pointer focus:outline-none focus:border-zinc-500"
                    {...createForm.register('vehicle_id', { required: 'Vehicle is required' })}
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {availableVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.model} ({v.registration_number}) - Cap: {v.max_load_capacity}kg
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3 text-zinc-500 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {availableVehicles.length === 0 && <span className="text-[10px] text-amber-500">No vehicles available currently.</span>}
              </div>

              {/* Driver Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Select Driver (Available)</label>
                <div className="relative flex items-center">
                  <select 
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs appearance-none cursor-pointer focus:outline-none focus:border-zinc-500"
                    {...createForm.register('driver_id', { required: 'Driver is required' })}
                  >
                    <option value="">-- Choose Driver --</option>
                    {availableDrivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} (Safety Score: {d.safety_score})
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3 text-zinc-500 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {availableDrivers.length === 0 && <span className="text-[10px] text-amber-500">No drivers available currently.</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Cargo Weight (kg)</label>
                  <input 
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="800"
                    {...createForm.register('cargo_weight', { required: 'Cargo weight is required', min: 0 })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Distance (km)</label>
                  <input 
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="1420"
                    {...createForm.register('planned_distance', { required: 'Distance is required', min: 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">ETA (minutes)</label>
                  <input 
                    type="number"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="1800"
                    {...createForm.register('eta_minutes')}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Target Revenue (₹)</label>
                  <input 
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="15000"
                    {...createForm.register('revenue')}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 mt-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Scheduling...' : 'Create Scheduled Trip'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Complete Trip Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center p-6 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Complete Trip Logs</h3>
              <button 
                onClick={() => { setCompleteModalOpen(false); completeForm.reset(); setError(null); }}
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

            <form onSubmit={completeForm.handleSubmit(onCompleteSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Final Odometer Reading (km)</label>
                <input 
                  type="number"
                  step="any"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-zinc-500"
                  placeholder="Final Odometer reading on arrival"
                  {...completeForm.register('final_odometer', { required: 'Final odometer is required' })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Fuel Consumed (Liters)</label>
                  <input 
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="120"
                    {...completeForm.register('fuel_liters', { required: 'Fuel volume is required' })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Total Fuel Cost (₹)</label>
                  <input 
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="12000"
                    {...completeForm.register('fuel_cost', { required: 'Fuel cost is required' })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Actual Revenue (₹) - Optional</label>
                <input 
                  type="number"
                  step="any"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-zinc-500"
                  placeholder="Actual invoiced billing amount"
                  {...completeForm.register('revenue')}
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 mt-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                disabled={completeMutation.isPending}
              >
                {completeMutation.isPending ? 'Logging Completion...' : 'Record Completion & Log Fuel'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Cancel Trip Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center p-6 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Cancel Trip</h3>
              <button 
                onClick={() => { setCancelModalOpen(false); cancelForm.reset(); setError(null); }}
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

            <form onSubmit={cancelForm.handleSubmit(onCancelSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Reason for Cancellation</label>
                <textarea 
                  rows="3"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-zinc-500 resize-none"
                  placeholder="Enter details like vehicle breakdown, weather issues, client cancelled..."
                  {...cancelForm.register('notes', { required: 'Cancellation reason is required' })}
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 mt-2 bg-red-900 hover:bg-red-850 text-zinc-100 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Processing...' : 'Abort & Cancel Trip'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
