// src/features/loans/LoanHistoryPage.tsx
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { loanService } from '../../services/loanService'
import type { Loan, LoanRequestResponse } from '../../types/loan'

export function LoanHistoryPage() {
  const { token } = useAuth()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loanRequests, setLoanRequests] = useState<LoanRequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'requests'>('active')

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return

      try {
        setLoading(true)
        const [loansData, requestsData] = await Promise.all([
          loanService.getLoans(token),
          loanService.getLoanRequests(token)
        ])
        
        setLoans(loansData)
        setLoanRequests(requestsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'completed':
      case 'paid':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando historial...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Historial de Préstamos</h2>
          <p className="text-gray-600 mt-1">Administra tus préstamos y solicitudes</p>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Préstamos Activos ({loans.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Solicitudes ({loanRequests.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'active' && (
            <div>
              {loans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes préstamos activos
                  </h3>
                  <p className="text-gray-500">
                    Cuando tengas préstamos aprobados, aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {loans.map((loan) => (
                    <div key={loan.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Préstamo #{loan.id.slice(0, 8)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Iniciado el {formatDate(loan.startDate)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(loan.status)}`}>
                          {loan.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-sm text-gray-500">Capital</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(loan.principal)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tasa de Interés</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {loan.interestRate}% anual
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Plazo</p>
                          <p className="text-lg font-semibold text-gray-700">
                            {loan.termMonths} meses
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Pago Mensual</p>
                          <p className="text-lg font-semibold text-green-600">
                            {loan.monthlyPayment 
                              ? formatCurrency(loan.monthlyPayment)
                              : formatCurrency(
                                  loanService.calculateMonthlyPayment(
                                    loan.principal,
                                    loan.interestRate,
                                    loan.termMonths
                                  )
                                )
                            }
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-3">
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                          Ver Detalles
                        </button>
                        <button className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                          Hacer Pago
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              {loanRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes solicitudes de préstamo
                  </h3>
                  <p className="text-gray-500">
                    Cuando realices solicitudes, aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {loanRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Solicitud #{request.id.slice(0, 8)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Solicitado el {formatDate(request.requestDate)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Monto Solicitado</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(request.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Plazo</p>
                          <p className="text-lg font-semibold text-gray-700">
                            {request.termMonths} meses
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Estado</p>
                          <p className="text-lg font-semibold text-gray-700">
                            {request.status}
                          </p>
                        </div>
                      </div>

                      {request.decision && (
                        <div className={`p-4 rounded-lg border ${getStatusColor(request.decision.result)}`}>
                          <h4 className="font-semibold mb-2">
                            Evaluación de IA: {
                              request.decision.result === 'approve' ? 'Pre-aprobado' :
                              request.decision.result === 'pending' ? 'En Revisión' :
                              'No Aprobado'
                            }
                          </h4>
                          <ul className="text-sm space-y-1">
                            {request.decision.reasons.map((reason, index) => (
                              <li key={index}>• {reason}</li>
                            ))}
                          </ul>
                          {request.decision.confidence && (
                            <p className="text-sm mt-2 opacity-75">
                              Confianza: {Math.round(request.decision.confidence * 100)}%
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
