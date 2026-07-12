import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

const MOCK_VEHICLES = [
  { id: 'v1', model: 'VAN-05', max_load_capacity: 500, status: 'Available' },
  { id: 'v2', model: 'TRUCK-11', max_load_capacity: 5000, status: 'On Trip' },
  { id: 'v3', model: 'MINI-03', max_load_capacity: 1000, status: 'In Shop' },
  { id: 'v4', model: 'VAN-09', max_load_capacity: 750, status: 'Retired' },
  { id: 'v5', model: 'TRUCK-12', max_load_capacity: 10000, status: 'Available' }
]

const MOCK_DRIVERS = [
  { id: 'd1', name: 'Alex', status: 'Available', license_expiry_date: '2028-12-31' },
  { id: 'd2', name: 'John', status: 'Suspended', license_expiry_date: '2025-03-15' }, // Expired
  { id: 'd3', name: 'Priya', status: 'On Trip', license_expiry_date: '2029-09-30' },
  { id: 'd4', name: 'Suresh', status: 'Off Duty', license_expiry_date: '2027-01-20' }
]

const MOCK_TRIPS = [
  {
    id: 'TR001',
    route: 'Ahmedabad Depot → Anandhand Hub',
    vehicle: 'VAN-05',
    driver: 'Alex',
    status: 'On Trip',
    eta: '45 min'
  },
  {
    id: 'TR004',
    route: 'Noida Industrial Area → Sonipat Warehouse',
    vehicle: 'TRUCK-12',
    driver: 'Suresh',
    status: 'Draft',
    eta: 'Awaiting driver'
  },
  {
    id: 'TR006',
    route: 'Manesar → Kalka Depot',
    vehicle: '—',
    driver: '—',
    status: 'Cancelled',
    eta: 'Route unsafe'
  }
]

export default function TripsPage() {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const [error, setError] = useState(null)
  
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      vehicle_model: '',
      driver_name: '',
      route: '',
      cargo_weight: 0,
      planned_distance: 0
    }
  })

  // Watch inputs for dynamic warnings
  const watchVehicle = watch('vehicle_model')
  const watchDriver = watch('driver_name')
  const watchCargoWeight = watch('cargo_weight')

  // Enforce access control guard: dispatcher only
  const isAuthorized = user?.role === 'dispatcher'

  // Fetch live trips from DB
  const { data: dbTrips = [], isLoading: tripsLoading } = useQuery({
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

  // Create Trip Mutation
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
        throw new Error(errData.detail || 'Failed to dispatch trip.')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      reset()
      setError(null)
    },
    onError: (err) => setError(err.message)
  })

  // Calculations for dynamic warnings
  const selectedVehicleObj = MOCK_VEHICLES.find(v => v.model === watchVehicle)
  const selectedDriverObj = MOCK_DRIVERS.find(d => d.name === watchDriver)

  const cargoWeightVal = parseFloat(watchCargoWeight || 0)
  const isCapacityExceeded = selectedVehicleObj && cargoWeightVal > selectedVehicleObj.max_load_capacity
  const capacityDiff = selectedVehicleObj ? cargoWeightVal - selectedVehicleObj.max_load_capacity : 0

  const today = new Date()
  const isDriverCredentialsBlocked = selectedDriverObj && (
    selectedDriverObj.status === 'Suspended' || new Date(selectedDriverObj.license_expiry_date) < today
  )

  const canDispatch = !isCapacityExceeded && !isDriverCredentialsBlocked && watchVehicle && watchDriver && watch('route')

  const onSubmit = (data) => {
    setError(null)
    createMutation.mutate({
      vehicle_id: selectedVehicleObj ? 1 : 0, // Mock id mapping
      driver_id: selectedDriverObj ? 1 : 0,
      cargo_weight: parseFloat(data.cargo_weight),
      planned_distance: parseFloat(data.planned_distance),
      destination: data.route
    })
  }

  // Combine Mock & DB trips
  const allTrips = [...MOCK_TRIPS]
  // Map DB trips to UI matching format
  dbTrips.forEach(dbT => {
    const formattedDbT = {
      id: `TR${String(dbT.id).padStart(3, '0')}`,
      route: dbT.destination || 'Custom route',
      vehicle: dbT.vehicle?.model || 'Vehicle',
      driver: dbT.driver?.name || 'Driver',
      status: dbT.status,
      eta: dbT.status === 'On Trip' ? 'Active' : '—'
    }
    if (!allTrips.some(t => t.id === formattedDbT.id)) {
      allTrips.push(formattedDbT)
    }
  })

  if (!isAuthorized) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center max-w-lg mx-auto mt-12 shadow-xl">
        <svg className="w-12 h-12 text-zinc-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-sm text-zinc-400">
          Only **Dispatchers** are authorized to manage or access the Live Dispatch Board.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Trip Lifecycle Bar */}
      <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider">Trip Dispatch Lifecycle</h3>
        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 select-none">
          <span className="text-zinc-200">Draft</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span className="text-zinc-200">Dispatched</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span className="text-zinc-200">Completed</span>
        </div>
      </div>

      {/* Grid: Create Trip Form (1/3) & Live Board (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create Trip Panel */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Create Trip</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {/* Vehicle Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Vehicle</label>
                <select
                  className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer"
                  {...register('vehicle_model', { required: true })}
                >
                  <option value="">Select vehicle...</option>
                  {MOCK_VEHICLES.map(v => (
                    <option key={v.id} value={v.model}>{v.model} ({v.status})</option>
                  ))}
                </select>
              </div>

              {/* Driver Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Driver</label>
                <select
                  className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 cursor-pointer"
                  {...register('driver_name', { required: true })}
                >
                  <option value="">Select driver...</option>
                  {MOCK_DRIVERS.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.status})</option>
                  ))}
                </select>
              </div>

              {/* Destination/Route Route */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Destination</label>
                <input
                  type="text"
                  placeholder="e.g. Ahmedabad Depot → Anandhand Hub"
                  className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-150 placeholder-zinc-650 focus:outline-none focus:border-zinc-500"
                  {...register('route', { required: 'Route description is required' })}
                />
              </div>

              {/* Weight & Distance */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 700"
                    className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-150 focus:outline-none"
                    {...register('cargo_weight', { min: 0 })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Planned Dist. (km)</label>
                  <input
                    type="number"
                    placeholder="e.g. 120"
                    className="bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2.5 text-sm text-zinc-150 focus:outline-none"
                    {...register('planned_distance', { min: 0 })}
                  />
                </div>
              </div>

              {/* Dynamic load limits & Driver details display boxes */}
              {(selectedVehicleObj || selectedDriverObj) && (
                <div className="border border-zinc-800 bg-zinc-950/40 rounded-lg p-3 text-[11px] flex flex-col gap-2">
                  {selectedVehicleObj && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Vehicle Load Limit:</span>
                      <span className="font-semibold text-zinc-200">{selectedVehicleObj.max_load_capacity} kg</span>
                    </div>
                  )}
                  {selectedDriverObj && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Driver License & Status:</span>
                      <span className={`font-semibold ${
                        isDriverCredentialsBlocked ? 'text-red-400' : 'text-zinc-200'
                      }`}>{selectedDriverObj.status} ({selectedDriverObj.license_expiry_date})</span>
                    </div>
                  )}
                </div>
              )}

              {/* Red Warning Card if capacity or driver blocked */}
              {isCapacityExceeded && (
                <div className="bg-red-950/15 border border-red-900/40 rounded-lg p-3.5 text-xs text-red-400 flex items-start gap-2">
                  <span className="font-extrabold uppercase mt-px tracking-wider border border-red-900/50 rounded px-1 text-[9px] bg-red-950/40 shrink-0">Block</span>
                  <p>Capacity exceeded by {capacityDiff} kg. Dispatch blocked.</p>
                </div>
              )}
              
              {isDriverCredentialsBlocked && (
                <div className="bg-red-950/15 border border-red-900/40 rounded-lg p-3.5 text-xs text-red-400 flex items-start gap-2">
                  <span className="font-extrabold uppercase mt-px tracking-wider border border-red-900/50 rounded px-1 text-[9px] bg-red-950/40 shrink-0">Block</span>
                  <p>Driver {selectedDriverObj.name} has suspended/expired credentials. Dispatch blocked.</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="px-4 py-2.5 bg-transparent border border-zinc-805 hover:bg-zinc-850 text-zinc-350 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canDispatch || createMutation.isPending}
                  className={`px-4 py-2.5 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    canDispatch 
                      ? 'bg-[#b87310] hover:bg-[#a0620c]' 
                      : 'bg-zinc-800 text-zinc-550 border border-zinc-850 cursor-not-allowed'
                  }`}
                >
                  {createMutation.isPending ? 'Dispatching...' : 'Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Live Board Listing (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Live Board</h3>
          {tripsLoading ? (
            <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-xl">
              <span className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin mx-auto block mb-4" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {allTrips.map((t) => (
                <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-zinc-750 transition-colors">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-zinc-150">{t.id}</span>
                      <span className="text-sm font-bold text-zinc-200">{t.route}</span>
                    </div>
                    <div className="text-xs text-zinc-450 font-medium">
                      Vehicle: <span className="font-semibold text-zinc-350">{t.vehicle}</span> &bull; Driver: <span className="font-semibold text-zinc-350">{t.driver}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between md:justify-end shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-zinc-400 block mb-0.5">ETA</span>
                      <span className="text-sm font-semibold text-zinc-250">{t.eta}</span>
                    </div>
                    
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${
                      t.status === 'On Trip' 
                        ? 'bg-blue-950/20 border-blue-900/40 text-blue-400'
                        : t.status === 'Completed'
                          ? 'bg-emerald-950/25 border-emerald-900/40 text-emerald-450'
                          : t.status === 'Draft'
                            ? 'bg-zinc-850 border-zinc-800 text-zinc-400'
                            : 'bg-red-950/15 border-red-900/40 text-red-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
