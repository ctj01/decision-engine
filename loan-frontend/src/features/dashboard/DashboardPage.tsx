// src/features/dashboard/DashboardPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loanService } from '../../services/loanService'
import { 
  DollarIcon, 
  TrendingUpIcon, 
  ClockIcon, 
  StarIcon,
  PlusIcon,
  FileTextIcon,
  CalculatorIcon,
  BarChartIcon
} from '../../components/icons'
import type { Loan, LoanRequestResponse } from '../../types/loan'

export function DashboardPage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [loans, setLoans] = useState<Loan[]>([])
  const [loanRequests, setLoanRequests] = useState<LoanRequestResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const [loansData, requestsData] = await Promise.all([
          loanService.getLoans(token),
          loanService.getLoanRequests(token)
        ])
        setLoans(loansData)
        setLoanRequests(requestsData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, navigate])

  // Calcular estadísticas
  const totalDebt = loans.reduce((sum, loan) => sum + loan.principal, 0)
  const activeLoans = loans.filter(loan => loan.status === 'Active').length
  const pendingRequests = loanRequests.filter(req => req.status === 'Pending').length
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 gradient-primary rounded-full animate-pulse-subtle flex items-center justify-center">
            <BarChartIcon className="text-white" size={24} />
          </div>
          <p className="text-gray-600 font-medium">Cargando tu dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pattern py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tu centro de control financiero donde puedes gestionar préstamos, 
            solicitar nuevos créditos y monitorear tu progreso.
          </p>
        </div>

        {error && (
          <div className="mb-8 card-modern p-6 border-l-4 border-red-500 bg-red-50">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card-modern card-hover p-6 gradient-primary text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Deuda Total</p>
                <p className="text-2xl md:text-3xl font-bold">
                  {formatCurrency(totalDebt)}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <DollarIcon className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="card-modern card-hover p-6 gradient-success text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Préstamos Activos</p>
                <p className="text-2xl md:text-3xl font-bold">{activeLoans}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <TrendingUpIcon className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="card-modern card-hover p-6 gradient-warning text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Solicitudes Pendientes</p>
                <p className="text-2xl md:text-3xl font-bold">{pendingRequests}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <ClockIcon className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="card-modern card-hover p-6 gradient-secondary text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Score Crediticio</p>
                <p className="text-2xl md:text-3xl font-bold">750</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <StarIcon className="text-white" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-modern p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/loan-application')}
              className="group p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 text-center"
            >
              <div className="gradient-primary mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <PlusIcon className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Solicitar Préstamo</h3>
              <p className="text-gray-600">Inicia una nueva solicitud de crédito</p>
            </button>

            <button
              onClick={() => navigate('/loan-history')}
              className="group p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all duration-300 text-center"
            >
              <div className="gradient-success mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileTextIcon className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ver Historial</h3>
              <p className="text-gray-600">Revisa tus préstamos y solicitudes</p>
            </button>

            <button
              onClick={() => {/* TODO: Implementar calculadora */}}
              className="group p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 text-center"
            >
              <div className="gradient-secondary mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <CalculatorIcon className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Calculadora</h3>
              <p className="text-gray-600">Simula tu préstamo ideal</p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Loans */}
          <div className="card-modern p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Préstamos Recientes</h2>
              <button
                onClick={() => navigate('/loan-history')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Ver todos →
              </button>
            </div>
            
            {loans.length === 0 ? (
              <div className="text-center py-12">
                <div className="gradient-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileTextIcon className="text-white" size={40} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes préstamos activos</h3>
                <p className="text-gray-600 mb-4">¡Solicita tu primer préstamo y comienza a construir tu historial crediticio!</p>
                <button
                  onClick={() => navigate('/loan-application')}
                  className="btn-primary"
                >
                  Solicitar Ahora
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {loans.slice(0, 3).map((loan, index) => (
                  <div key={loan.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl card-hover">
                    <div className="flex items-center space-x-4">
                      <div className="gradient-primary w-12 h-12 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">#{loan.id.slice(0, 8)}</p>
                        <p className="text-gray-600">{formatCurrency(loan.principal)}</p>
                      </div>
                    </div>
                    <span className={`status-${loan.status.toLowerCase()}`}>
                      {loan.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Requests */}
          <div className="card-modern p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Solicitudes Recientes</h2>
              <button
                onClick={() => navigate('/loan-history')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Ver todas →
              </button>
            </div>
            
            {loanRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="gradient-warning w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="text-white" size={40} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes solicitudes</h3>
                <p className="text-gray-600 mb-4">Crea tu primera solicitud y obtén una respuesta inmediata</p>
                <button
                  onClick={() => navigate('/loan-application')}
                  className="btn-primary"
                >
                  Crear Solicitud
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {loanRequests.slice(0, 3).map((request, index) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl card-hover">
                    <div className="flex items-center space-x-4">
                      <div className="gradient-secondary w-12 h-12 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">#{request.id.slice(0, 8)}</p>
                        <p className="text-gray-600">{formatCurrency(request.amount)}</p>
                      </div>
                    </div>
                    <span className={`status-${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
