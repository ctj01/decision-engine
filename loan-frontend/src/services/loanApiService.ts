// Base API configuration for loan-service.local
const BASE_URL = 'http://loan-service.local';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface CreateLoanRequestDto {
  customerId: string;
  amount: number;
  purpose: string;
  monthlyIncome: number;
  creditScore: number;
  employmentStatus: string;
  existingDebts: number;
}

export interface LoanRequestResponseDto {
  id: string;
  customerId: string;
  amount: number;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  aiScore?: number;
  aiRecommendation?: string;
  monthlyIncome: number;
  creditScore: number;
  employmentStatus: string;
  existingDebts: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoanStatisticsDto {
  totalLoans: number;
  approvedLoans: number;
  rejectedLoans: number;
  pendingLoans: number;
  totalAmount: number;
  averageAmount: number;
  approvalRate: number;
}

class LoanApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json();
  }

  // Create a new loan request
  async createLoanRequest(request: CreateLoanRequestDto): Promise<LoanRequestResponseDto> {
    const response = await fetch(`${BASE_URL}/loans/requests`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return this.handleResponse<LoanRequestResponseDto>(response);
  }

  // Get loan by ID
  async getLoanById(id: string): Promise<LoanRequestResponseDto> {
    const response = await fetch(`${BASE_URL}/loans/requests/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<LoanRequestResponseDto>(response);
  }

  // Get loans by customer ID
  async getLoansByCustomerId(customerId: string): Promise<LoanRequestResponseDto[]> {
    const response = await fetch(`${BASE_URL}/loans/requests/customer/${customerId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<LoanRequestResponseDto[]>(response);
  }

  // Get pending loans
  async getPendingLoans(): Promise<LoanRequestResponseDto[]> {
    const response = await fetch(`${BASE_URL}/loans/requests/status/pending`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<LoanRequestResponseDto[]>(response);
  }

  // Approve loan
  async approveLoan(id: string): Promise<LoanRequestResponseDto> {
    const response = await fetch(`${BASE_URL}/loans/requests/${id}/approve`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<LoanRequestResponseDto>(response);
  }

  // Reject loan
  async rejectLoan(id: string): Promise<LoanRequestResponseDto> {
    const response = await fetch(`${BASE_URL}/loans/requests/${id}/reject`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason: 'Rejected by user' }),
    });
    return this.handleResponse<LoanRequestResponseDto>(response);
  }

  // Re-evaluate loan with AI
  async reEvaluateLoan(id: string): Promise<LoanRequestResponseDto> {
    const response = await fetch(`${BASE_URL}/loans/requests/${id}/evaluate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<LoanRequestResponseDto>(response);
  }

  // Get loan statistics
  async getLoanStatistics(): Promise<LoanStatisticsDto> {
    const response = await fetch(`${BASE_URL}/loans/statistics`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<LoanStatisticsDto>(response);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string; version: string }> {
    const response = await fetch(`http://loan-service.local/health`);
    return this.handleResponse(response);
  }
}

export const loanApiService = new LoanApiService();
