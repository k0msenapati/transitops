import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

export default function DriversPage() {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [error, setError] = useState(null)

  // Enforce access control guard: fleet_manager and safety_officer
  const isAuthorized = ['fleet_manager', 'safety_officer'].includes(user?.role)

  // Fetch Drivers
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

  // Create Driver Mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Failed to register driver. Duplicate license number?')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
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
      safety_score: parseFloat(data.safety_score || 100.0)
    })
  }

  // Safety score color formatter
  const getSafetyScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400'
    if (score >= 70) return 'text-amber-400'
    return 'text-red-400'
  }

  if (!isAuthorized) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center max-w-lg mx-auto mt-12 shadow-xl">
        <svg className="w-12 h-12 text-zinc-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-sm text-zinc-400">
          Only **Fleet Managers** and **Safety Officers** are authorized to manage or view driver registries.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Drivers Registry</h2>
          <p className="text-sm text-zinc-400">Monitor operator safety, compliance scores, and license expirations</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Add Driver
        </button>
      </div>

      {/* Grid listing */}
      {isLoading ? (
        <div className="text-center py-20">
          <span className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin mx-auto block mb-4" />
          <p className="text-sm text-zinc-400">Loading operator profiles...</p>
        </div>
      ) : drivers.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-900 border-dashed rounded-xl p-12 text-center text-zinc-400">
          <p className="mb-2">No commercial drivers registered yet.</p>
          <button 
            onClick={() => setModalOpen(true)}
            className="text-zinc-100 font-semibold underline hover:text-zinc-300 cursor-pointer"
          >
            Register your first driver profile
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-xs font-semibold uppercase">
                  <th className="px-6 py-4">Driver Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">License Code</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Expiration</th>
                  <th className="px-6 py-4 text-center">Safety Score</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-zinc-850/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-100">{d.name}</td>
                    <td className="px-6 py-4 text-xs text-zinc-400">{d.contact_number}</td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">{d.license_number}</td>
                    <td className="px-6 py-4 text-xs text-zinc-300 font-semibold">{d.license_category}</td>
                    <td className="px-6 py-4 text-zinc-400">{d.license_expiry_date}</td>
                    <td className="px-6 py-4 text-center font-bold">
                      <span className={getSafetyScoreColor(d.safety_score)}>
                        {d.safety_score.toFixed(1)} / 100
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                        d.status === 'Available' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' 
                          : d.status === 'On Trip'
                            ? 'bg-blue-950 text-blue-400 border border-blue-900'
                            : d.status === 'Off Duty'
                              ? 'bg-zinc-950 text-zinc-400 border border-zinc-900'
                              : 'bg-red-950 text-red-400 border border-red-900'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center p-6 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Register Operator</h3>
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
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Driver Name</label>
                  <input 
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="Rahul Kumar"
                    {...register('name', { required: 'Name is required' })}
                    disabled={createMutation.isPending}
                  />
                  {errors.name && <span className="text-red-500 text-[10px]">{errors.name.message}</span>}
                </div>
                <div className="col-span-1 flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Contact Number</label>
                  <input 
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="9999999999"
                    {...register('contact_number', { required: 'Contact is required' })}
                    disabled={createMutation.isPending}
                  />
                  {errors.contact_number && <span className="text-red-500 text-[10px]">{errors.contact_number.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">License Number</label>
                  <input 
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="DL-1420230000000"
                    {...register('license_number', { required: 'License is required' })}
                    disabled={createMutation.isPending}
                  />
                  {errors.license_number && <span className="text-red-500 text-[10px]">{errors.license_number.message}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">License Category</label>
                  <select 
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-zinc-500"
                    {...register('license_category', { required: true })}
                    disabled={createMutation.isPending}
                  >
                    <option value="HMV">HMV (Heavy)</option>
                    <option value="LMV">LMV (Light)</option>
                    <option value="MCWG">MCWG (Motorcycle)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">License Expiry</label>
                  <input 
                    type="date"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-zinc-500"
                    {...register('license_expiry_date', { required: 'Expiry is required' })}
                    disabled={createMutation.isPending}
                  />
                  {errors.license_expiry_date && <span className="text-red-500 text-[10px]">{errors.license_expiry_date.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Initial Safety Score</label>
                  <input 
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-650 text-xs focus:outline-none focus:border-zinc-500"
                    placeholder="100"
                    defaultValue="100.0"
                    {...register('safety_score', { min: 0, max: 100 })}
                    disabled={createMutation.isPending}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Driver Status</label>
                  <select 
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-zinc-500"
                    {...register('status', { required: true })}
                    disabled={createMutation.isPending}
                  >
                    <option value="Available">Available</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 mt-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Registering...' : 'Register Driver'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
