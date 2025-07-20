// src/services/loanService.ts
import type { LoanRequest, LoanRequestResponse, Loan, LoanProduct, AIDecisionRequest, AIDecisionResponse } from '../types/loan'

const LOAN_SERVICE_URL = import.meta.env.VITE_LOAN_SERVICE_URL || 'http://loan-service.local'
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://ai-service.local'

class LoanService {
  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  // Obtener productos de préstamos disponibles
  async getLoanProducts(token: string): Promise<LoanProduct[]> {
    const response = await fetch(`${LOAN_SERVICE_URL}/loan-products`, {
      headers: this.getAuthHeaders(token),
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch loan products')
    }
    
    return response.json()
  }

  // Crear solicitud de préstamo
  async createLoanRequest(token: string, request: LoanRequest): Promise<LoanRequestResponse> {
    const response = await fetch(`${LOAN_SERVICE_URL}/loan-requests`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(request),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create loan request: ${error}`)
    }
    
    return response.json()
  }

  // Obtener solicitudes de préstamo del usuario
  async getLoanRequests(token: string): Promise<LoanRequestResponse[]> {
    const response = await fetch(`${LOAN_SERVICE_URL}/loan-requests`, {
      headers: this.getAuthHeaders(token),
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch loan requests')
    }
    
    return response.json()
  }

  // Obtener préstamos activos del usuario
  async getLoans(token: string): Promise<Loan[]> {
    const response = await fetch(`${LOAN_SERVICE_URL}/loans`, {
      headers: this.getAuthHeaders(token),
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch loans')
    }
    
    return response.json()
  }

  // Solicitar evaluación de IA
  async getAIDecision(token: string, request: AIDecisionRequest): Promise<AIDecisionResponse> {
    const response = await fetch(`${AI_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(request),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`AI evaluation failed: ${error}`)
    }
    
    return response.json()
  }

  // Simular historial de pagos (para el demo)
  generateMockPaymentHistory(): Array<{ month: string; status: 'on_time' | 'late' | 'missed'; days_late?: number }> {
    const months = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthStr = date.toISOString().substring(0, 7) // YYYY-MM format
      
      // 80% probabilidad de estar a tiempo
      const random = Math.random()
      if (random < 0.8) {
        months.push({ month: monthStr, status: 'on_time' as const })
      } else if (random < 0.95) {
        months.push({ 
          month: monthStr, 
          status: 'late' as const, 
          days_late: Math.floor(Math.random() * 15) + 1 
        })
      } else {
        months.push({ month: monthStr, status: 'missed' as const })
      }
    }
    
    return months
  }

  // Calcular pago mensual estimado
  calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
    const monthlyRate = annualRate / 100 / 12
    if (monthlyRate === 0) return principal / termMonths
    
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                   (Math.pow(1 + monthlyRate, termMonths) - 1)
    
    return Math.round(payment * 100) / 100
  }
}

export const loanService = new LoanService()
