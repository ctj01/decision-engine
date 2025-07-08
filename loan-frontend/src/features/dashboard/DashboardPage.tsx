// src/features/dashboard/DashboardPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface Loan {
  id: string
  amount: number
  status: string
}

export function DashboardPage() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // si no hay token, vuelvo al login
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    const fetchLoans = async () => {
      setLoading(true)
      try {
        const res = await fetch('http://loan-service.local/loans', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load loans')
        const data: Loan[] = await res.json()
        setLoans(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [token, navigate])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="mb-4">
        <p>Welcome! Here are your loans:</p>
      </div>

      <div>
        <h3 className="text-xl font-medium mb-2">Your Loans</h3>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <ul className="space-y-2">
            {loans.map((loan) => (
              <li key={loan.id} className="p-4 border rounded shadow-sm">
                <p><strong>ID:</strong> {loan.id}</p>
                <p><strong>Amount:</strong> ${loan.amount.toFixed(2)}</p>
                <p><strong>Status:</strong> {loan.status}</p>
              </li>
            ))}
            {loans.length === 0 && <p>No loans found.</p>}
          </ul>
        )}
      </div>
    </div>
  )
}
