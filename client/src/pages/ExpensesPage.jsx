import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

const MOCK_FUEL_LOGS = [
  {
    id: 'f1',
    vehicle: 'VAN-05',
    date: '05 Jul 2026',
    liters: 42,
    cost: 3850
  },
  {
    id: 'f2',
    vehicle: 'TRUCK-11',
    date: '06 Jul 2026',
    liters: 90,
    cost: 8400
  },
  {
    id: 'f3',
    vehicle: 'MINI-03',
    date: '05 Jul 2026',
    liters: 25,
    cost: 2050
  }
]

const MOCK_OTHER_EXPENSES = [
  {
    id: 'o1',
    trip_id: 'TR001',
    vehicle: 'VAN-05',
    toll: 120,
    other: 0,
    total: 120,
    status: 'Available'
  },
  {
    id: 'o2',
    trip_id: 'TR002',
    vehicle: 'TRK-12',
    toll: 340,
    other: 150,
    total: 18000, // Total trip cost or maintenance item included
    status: 'Completed'
  }
]

export default function ExpensesPage() {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  const [error, setError] = useState(null)
  
  // Modals for adding items
  const [fuelModalOpen, setFuelModalOpen] = useState(false)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)

  const fuelForm = useForm()
  const expenseForm = useForm()

  // Enforce access control guard: financial_analyst only
  const isAuthorized = user?.role === 'financial_analyst'

  // Fetch Fuel Logs
  const { data: dbFuel = [], isLoading: isLoadingFuel } = useQuery({
    queryKey: ['fuelLogs', token],
    queryFn: async () => {
      const res = await fetch('/api/expenses/fuel', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch fuel logs')
      return res.json()
    },
    enabled: !!token
  })

  // Fetch Other Expenses
  const { data: dbExpenses = [], isLoading: isLoadingOther } = useQuery({
    queryKey: ['otherExpenses', token],
    queryFn: async () => {
      const res = await fetch('/api/expenses/other', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch other expenses')
      return res.json()
    },
    enabled: !!token
  })

  // Mutations
  const addFuelMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/expenses/fuel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to log fuel.')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelLogs'] })
      setFuelModalOpen(false)
      fuelForm.reset()
    }
  })

  const addExpenseMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/expenses/other', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to add expense.')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otherExpenses'] })
      setExpenseModalOpen(false)
      expenseForm.reset()
    }
  })

  const onFuelSubmit = (data) => {
    setError(null)
    addFuelMutation.mutate({
      vehicle_id: 1, // Mock DB link
      liters: parseFloat(data.liters),
      cost: parseFloat(data.cost),
      date: data.date
    })
  }

  const onExpenseSubmit = (data) => {
    setError(null)
    addExpenseMutation.mutate({
      vehicle_id: 1,
      type: 'Toll',
      cost: parseFloat(data.cost),
      description: data.description,
      date: data.date
    })
  }

  // Combine Mock & DB fuel logs
  const allFuel = [...MOCK_FUEL_LOGS]
  dbFuel.forEach(dbF => {
    const formatted = {
      id: dbF.id,
      vehicle: `Vehicle #${dbF.vehicle_id}`,
      date: dbF.date,
      liters: dbF.liters,
      cost: dbF.cost
    }
    if (!allFuel.some(f => f.date === formatted.date && f.liters === formatted.liters)) {
      allFuel.push(formatted)
    }
  })

  // Combine Mock & DB expenses
  const allExpenses = [...MOCK_OTHER_EXPENSES]
  dbExpenses.forEach(dbE => {
    const formatted = {
      id: dbE.id,
      trip_id: dbE.trip_id ? `TR${String(dbE.trip_id).padStart(3, '0')}` : '—',
      vehicle: `Vehicle #${dbE.vehicle_id}`,
      toll: dbE.type === 'Toll' ? dbE.cost : 0,
      other: dbE.type !== 'Toll' ? dbE.cost : 0,
      total: dbE.cost,
      status: 'Active'
    }
    if (!allExpenses.some(exp => exp.total === formatted.total && exp.trip_id === formatted.trip_id)) {
      allExpenses.push(formatted)
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
          Only **Financial Analysts** are authorized to access Fuel & Expenses ledger data.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      
      {/* Upper Panel: Fuel Logs */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Fuel Logs</h3>
          <button
            onClick={() => setFuelModalOpen(true)}
            className="px-3 py-1.5 bg-[#b87310] hover:bg-[#a0620c] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            + Log Fuel
          </button>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-850/50 border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Vehicle</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Liters</th>
                <th className="p-4 font-semibold text-right">Cost (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {allFuel.map((f) => (
                <tr key={f.id} className="hover:bg-zinc-850/10 transition-colors">
                  <td className="p-4 text-zinc-200 font-bold tracking-wide">{f.vehicle}</td>
                  <td className="p-4 text-zinc-400 font-semibold">{f.date}</td>
                  <td className="p-4 text-zinc-300 font-semibold">{f.liters} L</td>
                  <td className="p-4 text-right text-zinc-100 font-bold">₹{f.cost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Middle Panel: Other Expenses */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Other Expenses (Toll / Misc)</h3>
          <button
            onClick={() => setExpenseModalOpen(true)}
            className="px-3 py-1.5 bg-[#b87310] hover:bg-[#a0620c] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            + Add Expense
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-850/50 border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Trip</th>
                <th className="p-4 font-semibold">Vehicle</th>
                <th className="p-4 font-semibold text-right">Toll</th>
                <th className="p-4 font-semibold text-right">Other</th>
                <th className="p-4 font-semibold text-right">Total</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {allExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-850/10 transition-colors">
                  <td className="p-4 text-zinc-200 font-bold tracking-wide">{e.trip_id}</td>
                  <td className="p-4 text-zinc-400 font-semibold">{e.vehicle}</td>
                  <td className="p-4 text-right text-zinc-350">₹{e.toll.toLocaleString()}</td>
                  <td className="p-4 text-right text-zinc-350">₹{e.other.toLocaleString()}</td>
                  <td className="p-4 text-right text-zinc-100 font-bold">₹{e.total.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      e.status === 'Completed'
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-450'
                        : 'bg-blue-950/20 border-blue-900/40 text-blue-400'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Highlight Bar */}
      <div className="border border-zinc-800 bg-[#b87310]/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <span className="text-xs font-black uppercase text-zinc-350 tracking-wider">Total Operational Cost (Actual)</span>
        <span className="text-lg font-black text-amber-500">
          Fuel (₹14,300) + Maintenance (₹19,770) = ₹34,070
        </span>
      </div>

      {/* Add Fuel Modal */}
      {fuelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <header className="mb-6 flex justify-between items-center">
              <h3 className="text-lg font-bold text-zinc-100">Log Fuel Consumption</h3>
              <button onClick={() => setFuelModalOpen(false)} className="text-zinc-550 hover:text-zinc-300 cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </header>
            <form onSubmit={fuelForm.handleSubmit(onFuelSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Liters *</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 42"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100"
                  {...fuelForm.register('liters', { required: true })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Cost (INR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 3850"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100"
                  {...fuelForm.register('cost', { required: true })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Date *</label>
                <input
                  type="date"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-300 cursor-pointer"
                  {...fuelForm.register('date', { required: true })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setFuelModalOpen(false)}
                  className="px-4 py-2 bg-transparent border border-zinc-800 text-zinc-350 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#b87310] hover:bg-[#a0620c] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Log Fuel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {expenseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <header className="mb-6 flex justify-between items-center">
              <h3 className="text-lg font-bold text-zinc-100">Log Operational Expense</h3>
              <button onClick={() => setExpenseModalOpen(false)} className="text-zinc-550 hover:text-zinc-300 cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </header>
            <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Highway Toll Fee"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100"
                  {...expenseForm.register('description', { required: true })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Cost (INR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 120"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100"
                  {...expenseForm.register('cost', { required: true })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Date *</label>
                <input
                  type="date"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-300 cursor-pointer"
                  {...expenseForm.register('date', { required: true })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  className="px-4 py-2 bg-transparent border border-zinc-800 text-zinc-350 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#b87310] hover:bg-[#a0620c] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
