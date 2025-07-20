// src/features/loans/LoanApplicationPage.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loanService } from '../../services/loanService'
import type { LoanRequest, AIDecisionResponse } from '../../types/loan'

type FormData = {
  amount: number
  termMonths: number
  purpose: string
  monthlyIncome: number
  currentDebt: number
  creditScore: number
  employmentStatus: string
  employmentYears: number
  age: number
}

export function LoanApplicationPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiDecision, setAiDecision] = useState<AIDecisionResponse | null>(null)
  const [showResults, setShowResults] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      amount: 10000,
      termMonths: 12,
      purpose: 'personal',
      monthlyIncome: 50000,
      currentDebt: 5000,
      creditScore: 650,
      employmentStatus: 'employed',
      employmentYears: 2,
      age: 30
    }
  })

  const watchedAmount = watch('amount')
  const watchedTerm = watch('termMonths')
  const watchedIncome = watch('monthlyIncome')

  // Calcular pago mensual estimado
  const estimatedPayment = loanService.calculateMonthlyPayment(
    watchedAmount || 0,
    8.5, // Tasa de ejemplo
    watchedTerm || 12
  )

  // Calcular relación deuda-ingreso
  const debtToIncomeRatio = watchedIncome > 0 ? 
    ((watch('currentDebt') || 0) + estimatedPayment) / (watchedIncome || 1) * 100 : 0

  const onSubmit = async (data: FormData) => {
    if (!token) return

    setIsSubmitting(true)
    
    try {
      // 1. Primero obtenemos la evaluación de IA
      const paymentHistory = loanService.generateMockPaymentHistory()
      
      const aiRequest = {
        salary: data.monthlyIncome * 12, // Convertir a anual
        age: data.age,
        credit_score: data.creditScore,
        total_debt: data.currentDebt,
        payment_history: paymentHistory
      }

      console.log('Sending AI request:', aiRequest)
      const decision = await loanService.getAIDecision(token, aiRequest)
      setAiDecision(decision)

      // 2. Crear la solicitud de préstamo
      const loanRequest: LoanRequest = {
        amount: data.amount,
        termMonths: data.termMonths,
        purpose: data.purpose,
        monthlyIncome: data.monthlyIncome,
        currentDebt: data.currentDebt,
        creditScore: data.creditScore,
        employmentStatus: data.employmentStatus,
        employmentYears: data.employmentYears
      }

      console.log('Creating loan request:', loanRequest)
      const response = await loanService.createLoanRequest(token, loanRequest)
      
      console.log('Loan request created:', response)
      setShowResults(true)

    } catch (error) {
      console.error('Error processing loan application:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'approve': return 'text-green-600 bg-green-50 border-green-200'
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'reject': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'approve': return '✅'
      case 'pending': return '⏳'
      case 'reject': return '❌'
      default: return '❓'
    }
  }

  if (showResults && aiDecision) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            Resultado de su Solicitud
          </h2>
          
          <div className={`p-6 rounded-lg border-2 ${getDecisionColor(aiDecision.decision)} mb-6`}>
            <div className="text-center">
              <div className="text-4xl mb-2">{getDecisionIcon(aiDecision.decision)}</div>
              <h3 className="text-xl font-semibold mb-2">
                {aiDecision.decision === 'approve' && 'Pre-aprobado'}
                {aiDecision.decision === 'pending' && 'En Revisión'}
                {aiDecision.decision === 'reject' && 'No Aprobado'}
              </h3>
              {aiDecision.confidence && (
                <p className="text-sm opacity-75">
                  Confianza: {Math.round(aiDecision.confidence * 100)}%
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-3">Razones de la Decisión:</h4>
            <ul className="space-y-2">
              {aiDecision.reasons.map((reason, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowResults(false)
                setAiDecision(null)
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Nueva Solicitud
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ver Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Solicitud de Préstamo
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información del Préstamo */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Información del Préstamo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Solicitado ($)
                </label>
                <input
                  type="number"
                  {...register('amount', { 
                    required: 'El monto es requerido',
                    min: { value: 1000, message: 'Monto mínimo $1,000' },
                    max: { value: 100000, message: 'Monto máximo $100,000' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plazo (meses)
                </label>
                <select
                  {...register('termMonths', { required: 'El plazo es requerido' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={6}>6 meses</option>
                  <option value={12}>12 meses</option>
                  <option value={18}>18 meses</option>
                  <option value={24}>24 meses</option>
                  <option value={36}>36 meses</option>
                  <option value={48}>48 meses</option>
                  <option value={60}>60 meses</option>
                </select>
                {errors.termMonths && (
                  <p className="mt-1 text-sm text-red-600">{errors.termMonths.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Propósito del Préstamo
                </label>
                <select
                  {...register('purpose', { required: 'El propósito es requerido' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="personal">Personal</option>
                  <option value="auto">Vehículo</option>
                  <option value="home">Vivienda</option>
                  <option value="education">Educación</option>
                  <option value="business">Negocio</option>
                  <option value="debt_consolidation">Consolidación de Deudas</option>
                </select>
                {errors.purpose && (
                  <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Información Financiera</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingresos Mensuales ($)
                </label>
                <input
                  type="number"
                  {...register('monthlyIncome', { 
                    required: 'Los ingresos son requeridos',
                    min: { value: 1, message: 'Ingresos deben ser mayor a 0' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.monthlyIncome && (
                  <p className="mt-1 text-sm text-red-600">{errors.monthlyIncome.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deudas Actuales ($)
                </label>
                <input
                  type="number"
                  {...register('currentDebt', { 
                    required: 'Las deudas actuales son requeridas',
                    min: { value: 0, message: 'No puede ser negativo' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.currentDebt && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentDebt.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puntaje Crediticio
                </label>
                <input
                  type="number"
                  {...register('creditScore', { 
                    required: 'El puntaje crediticio es requerido',
                    min: { value: 300, message: 'Puntaje mínimo 300' },
                    max: { value: 850, message: 'Puntaje máximo 850' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.creditScore && (
                  <p className="mt-1 text-sm text-red-600">{errors.creditScore.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad
                </label>
                <input
                  type="number"
                  {...register('age', { 
                    required: 'La edad es requerida',
                    min: { value: 18, message: 'Debe ser mayor de 18 años' },
                    max: { value: 80, message: 'Edad máxima 80 años' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información Laboral */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Información Laboral</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado Laboral
                </label>
                <select
                  {...register('employmentStatus', { required: 'El estado laboral es requerido' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="employed">Empleado</option>
                  <option value="self_employed">Trabajador Independiente</option>
                  <option value="unemployed">Desempleado</option>
                  <option value="retired">Jubilado</option>
                  <option value="student">Estudiante</option>
                </select>
                {errors.employmentStatus && (
                  <p className="mt-1 text-sm text-red-600">{errors.employmentStatus.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Años de Empleo
                </label>
                <input
                  type="number"
                  step="0.5"
                  {...register('employmentYears', { 
                    required: 'Los años de empleo son requeridos',
                    min: { value: 0, message: 'No puede ser negativo' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.employmentYears && (
                  <p className="mt-1 text-sm text-red-600">{errors.employmentYears.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Resumen Financiero */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Resumen de la Solicitud</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Pago Mensual Estimado</p>
                <p className="text-xl font-bold text-blue-600">
                  ${estimatedPayment.toLocaleString()}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600">Relación Deuda-Ingreso</p>
                <p className={`text-xl font-bold ${debtToIncomeRatio > 40 ? 'text-red-600' : 'text-green-600'}`}>
                  {debtToIncomeRatio.toFixed(1)}%
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600">Total a Pagar</p>
                <p className="text-xl font-bold text-gray-800">
                  ${(estimatedPayment * (watchedTerm || 12)).toLocaleString()}
                </p>
              </div>
            </div>
            
            {debtToIncomeRatio > 40 && (
              <div className="mt-3 p-3 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-800">
                ⚠️ Su relación deuda-ingreso es alta. Esto puede afectar la aprobación de su solicitud.
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Procesando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
