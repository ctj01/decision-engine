// src/types/loan.ts

export interface LoanRequest {
  customerId?: string
  amount: number
  termMonths: number
  purpose?: string
  monthlyIncome: number
  currentDebt: number
  creditScore?: number
  employmentStatus: string
  employmentYears: number
}

export interface LoanRequestResponse {
  id: string
  customerId: string
  amount: number
  termMonths: number
  status: string
  requestDate: string
  decision?: {
    result: 'approve' | 'pending' | 'reject'
    reasons: string[]
    confidence?: number
  }
}

export interface Loan {
  id: string
  customerId: string
  loanRequestId: string
  principal: number
  interestRate: number
  termMonths: number
  startDate: string
  status: string
  monthlyPayment?: number
}

export interface LoanProduct {
  id: string
  name: string
  description: string
  minAmount: number
  maxAmount: number
  minTermMonths: number
  maxTermMonths: number
  annualInterestRate: number
}

export interface AIDecisionRequest {
  salary: number
  age: number
  credit_score: number
  total_debt: number
  payment_history: Array<{
    month: string
    status: 'on_time' | 'late' | 'missed'
    days_late?: number
  }>
}

export interface AIDecisionResponse {
  decision: 'approve' | 'pending' | 'reject'
  reasons: string[]
  confidence?: number
}
