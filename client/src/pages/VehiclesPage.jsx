import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

const MOCK_VEHICLES = [
  {
    id: 'm1',
    registration_number: 'GJ01AB452',
    model: 'VAN-05',
    type: 'Van',
    max_load_capacity: 500,
    odometer: 74000,
    acquisition_cost: 620000,
    status: 'Available'
  },
  {
    id: 'm2',
    registration_number: 'GJ01AB998',
    model: 'TRUCK-11',
    type: 'Truck',
    max_load_capacity: 5000,
    odometer: 182000,
    acquisition_cost: 2450000,
    status: 'On Trip'
  },
  {
    id: 'm3',
    registration_number: 'GJ01AB1120',
    model: 'MINI-03',
    type: 'Mini',
    max_load_capacity: 1000,
    odometer: 66000,
    acquisition_cost: 410000,
    status: 'In Shop'
  },
  {
    id: 'm4',
    registration_number: 'GJ01AB0008',
    model: 'VAN-09',
    type: 'Van',
    max_load_capacity: 750,
    odometer: 241900,
    acquisition_cost: 590000,
    status: 'Retired'
  }
]

export default function VehiclesPage() {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [error, setError] = useState(null)
  
  // Search and filter states
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  // Enforce Fleet Manager access guard
  const isManager = user?.role === 'fleet_manager'

  // Fetch Vehicles
  const { data: dbVehicles = [], isLoading } = useQuery({
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
        throw new Error(errData.detail || 'Failed to create vehicle.')
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

  // Combine Mock vehicles & DB vehicles (ensuring no duplicate reg numbers)
  const allVehicles = [...MOCK_VEHICLES]
  dbVehicles.forEach(dbV => {
    if (!allVehicles.some(v => v.registration_number.toLowerCase() === dbV.registration_number.toLowerCase())) {
      allVehicles.push(dbV)
    }
  })

  // Apply filters
  const filteredVehicles = allVehicles.filter(v => {
    const matchesSearch = v.registration_number.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === 'All' || v.type === filterType
    const matchesStatus = filterStatus === 'All' || v.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const formatCapacity = (capacity) => {
    if (capacity >= 1000) {
      const tons = capacity / 1000
      return `${tons} Ton${tons > 1 ? 's' : ''}`
    }
    return `${capacity} kg`
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
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-350 focus:outline-none cursor-pointer focus:border-zinc-500 transition-colors"
          >
            <option value="All">Type: All</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Mini">Mini</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-350 focus:outline-none cursor-pointer focus:border-zinc-500 transition-colors"
          >
            <option value="All">Status: All</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
          <input
            type="text"
            placeholder="Search reg. no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-350 focus:outline-none focus:border-zinc-500 transition-colors placeholder-zinc-650 w-48"
          />
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-[#b87310] hover:bg-[#a0620c] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <span>+ Add Vehicle</span>
        </button>
      </div>

      {/* Fleet Table */}
      {isLoading ? (
        <div className="text-center py-20">
          <span className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin mx-auto block mb-4" />
          <p className="text-sm text-zinc-400">Loading Fleet Registry...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-900 border-dashed rounded-xl p-12 text-center text-zinc-400">
          <p>No vehicles found in fleet registry.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-850/50 border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Reg. No. (Unique)</th>
                <th className="p-4 font-semibold">Name/Model</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Capacity</th>
                <th className="p-4 font-semibold">Odometer</th>
                <th className="p-4 font-semibold">Acq. Cost</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {filteredVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-850/10 transition-colors">
                  <td className="p-4 text-zinc-200 font-bold tracking-wide">{v.registration_number}</td>
                  <td className="p-4 text-zinc-400 font-semibold">{v.model}</td>
                  <td className="p-4 text-zinc-450">{v.type}</td>
                  <td className="p-4 text-zinc-300 font-medium">{formatCapacity(v.max_load_capacity)}</td>
                  <td className="p-4 text-zinc-300 font-medium">{v.odometer.toLocaleString()}</td>
                  <td className="p-4 text-zinc-300 font-medium">₹{v.acquisition_cost.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${
                      v.status === 'Available' 
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400'
                        : v.status === 'On Trip'
                          ? 'bg-blue-950/20 border-blue-900/40 text-blue-400'
                          : v.status === 'In Shop'
                            ? 'bg-amber-950/20 border-amber-900/40 text-amber-500'
                            : 'bg-red-950/25 border-red-900/40 text-red-400'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Rule Text */}
      <div className="text-xs text-amber-600 font-semibold leading-relaxed mt-2 select-none">
        Rule: Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatcher
      </div>

      {/* Add Vehicle Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl shadow-black">
            <header className="mb-6 flex justify-between items-center">
              <h3 className="text-lg font-bold text-zinc-100">Add New Fleet Vehicle</h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-550 hover:text-zinc-300 cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </header>

            {error && (
              <div className="mb-4 p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-xs text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Registration Number *</label>
                <input
                  type="text"
                  placeholder="e.g. GJ01AB452"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  {...register('registration_number', { required: 'Reg number is required' })}
                />
                {errors.registration_number && <span className="text-red-500 text-xs">{errors.registration_number.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Name/Model *</label>
                <input
                  type="text"
                  placeholder="e.g. VAN-05"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  {...register('model', { required: 'Model is required' })}
                />
                {errors.model && <span className="text-red-500 text-xs">{errors.model.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Type *</label>
                  <select
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-zinc-500 cursor-pointer"
                    {...register('type', { required: true })}
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Mini">Mini</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Capacity (kg) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                    {...register('max_load_capacity', { required: 'Capacity is required', min: 1 })}
                  />
                  {errors.max_load_capacity && <span className="text-red-500 text-xs">{errors.max_load_capacity.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Odometer (km)</label>
                  <input
                    type="number"
                    placeholder="e.g. 74000"
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                    {...register('odometer')}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Acq. Cost (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 620000"
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                    {...register('acquisition_cost')}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-transparent border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-[#b87310] hover:bg-[#a0620c] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {createMutation.isPending ? 'Saving...' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
