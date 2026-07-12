import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

export default function VehiclesPage() {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [error, setError] = useState(null)

  // Enforce Fleet Manager access guard
  const isManager = user?.role === 'fleet_manager'

  // Fetch Vehicles
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles', token],
    queryFn: async () => {
      const res = await fetch('/api/vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch vehicles')
      return res.json()
    },
    enabled: !!token
  })

  // Create Vehicle Mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Failed to create vehicle. Check duplicate registration number.')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      setModalOpen(false)
      reset()
      setError(null)
    },
    onError: (err) => {
      setError(err.message)
    }
  })

  const onSubmit = (data) => {
    setError(null)
    createMutation.mutate({
      ...data,
      max_load_capacity: parseFloat(data.max_load_capacity),
      odometer: parseFloat(data.odometer || 0),
      acquisition_cost: parseFloat(data.acquisition_cost || 0)
    })
  }

  if (!isManager) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center max-w-lg mx-auto mt-12 shadow-xl">
        <svg className="w-12 h-12 text-zinc-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-sm text-zinc-400">
          Only operators with the **Fleet Manager** role are authorized to manage or view the Fleet Registry.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fleet Registry</h2>
          <p className="text-sm text-zinc-400">Manage all logistics vehicles and configurations</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Add Vehicle
        </button>
      </div>

      {/* Grid listing */}
      {isLoading ? (
        <div className="text-center py-20">
          <span className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin mx-auto block mb-4" />
          <p className="text-sm text-zinc-400">Loading fleet registry...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-900 border-dashed rounded-xl p-12 text-center text-zinc-400">
          <p className="mb-2">No vehicles registered in the fleet yet.</p>
          <button 
            onClick={() => setModalOpen(true)}
            className="text-zinc-100 font-semibold underline hover:text-zinc-300 cursor-pointer"
          >
            Register your first vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md hover:border-zinc-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold">{v.type}</span>
                  <h4 className="text-lg font-bold text-zinc-100 mt-0.5">{v.model}</h4>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                  v.status === 'Available' 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' 
                    : v.status === 'On Trip'
                      ? 'bg-blue-950 text-blue-400 border border-blue-900'
                      : v.status === 'In Shop'
                        ? 'bg-amber-950 text-amber-400 border border-amber-900'
                        : 'bg-zinc-950 text-zinc-400 border border-zinc-900'
                }`}>
                  {v.status}
                </span>
              </div>

              <div className="flex flex-col gap-2 text-xs border-t border-zinc-850 pt-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Reg Plate</span>
                  <span className="font-semibold text-zinc-350">{v.registration_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Odometer</span>
                  <span className="font-semibold text-zinc-350">{v.odometer.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Max Capacity</span>
                  <span className="font-semibold text-zinc-350">{v.max_load_capacity.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cost</span>
                  <span className="font-semibold text-zinc-350">₹{v.acquisition_cost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center p-6 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Register Vehicle</h3>
              <button 
                onClick={() => { setModalOpen(false); reset(); setError(null); }}
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

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Registration Plate</label>
                <input 
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500"
                  placeholder="KA-01-MJ-9999"
                  {...register('registration_number', { required: 'Reg number is required' })}
                  disabled={createMutation.isPending}
                />
                {errors.registration_number && <span className="text-red-500 text-[10px]">{errors.registration_number.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Model Name</label>
                  <input 
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="Tata Ace / Mahindra Bolero"
                    {...register('model', { required: 'Model is required' })}
                    disabled={createMutation.isPending}
                  />
                  {errors.model && <span className="text-red-500 text-[10px]">{errors.model.message}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Vehicle Type</label>
                  <select 
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-zinc-500"
                    {...register('type', { required: true })}
                    disabled={createMutation.isPending}
                  >
                    <option value="Mini Truck">Mini Truck</option>
                    <option value="Van">Van</option>
                    <option value="Box Truck">Box Truck</option>
                    <option value="Container">Container Truck</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Load Capacity (kg)</label>
                  <input 
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="1200"
                    {...register('max_load_capacity', { required: 'Capacity is required', min: 0 })}
                    disabled={createMutation.isPending}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Odometer (km)</label>
                  <input 
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="0"
                    {...register('odometer')}
                    disabled={createMutation.isPending}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Acquisition Cost (₹)</label>
                  <input 
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="650000"
                    {...register('acquisition_cost')}
                    disabled={createMutation.isPending}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 mt-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Registering...' : 'Register Vehicle'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
