import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface LoanRequest {
  id: string;
  customerId: string;
  amount: number;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  aiScore?: number;
  aiRecommendation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanStatistics {
  totalLoans: number;
  approvedLoans: number;
  rejectedLoans: number;
  pendingLoans: number;
  totalAmount: number;
  averageAmount: number;
  approvalRate: number;
}

export interface LoanState {
  loans: LoanRequest[];
  currentLoan: LoanRequest | null;
  statistics: LoanStatistics | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LoanState = {
  loans: [],
  currentLoan: null,
  statistics: null,
  isLoading: false,
  error: null,
};

// Async thunks for loan operations
export const createLoanRequest = createAsyncThunk(
  'loans/create',
  async (loanData: {
    customerId: string;
    amount: number;
    purpose: string;
    monthlyIncome: number;
    creditScore: number;
    employmentStatus: string;
    existingDebts: number;
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch('http://loan-service.local/loans/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.auth.token}`,
        },
        body: JSON.stringify(loanData),
      });

      if (!response.ok) {
        throw new Error('Failed to create loan request');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create loan');
    }
  }
);

export const fetchLoans = createAsyncThunk(
  'loans/fetchAll',
  async (customerId: string | undefined, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const url = customerId 
        ? `http://loan-service.local/loans/requests/customer/${customerId}`
        : 'http://loan-service.local/loans/requests/status/pending';
      
      console.log('Fetching loans from:', url);
      console.log('Token:', state.auth.token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`Failed to fetch loans: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch loans');
    }
  }
);

export const fetchLoanById = createAsyncThunk(
  'loans/fetchById',
  async (loanId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`http://loan-service.local/loans/requests/${loanId}`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loan');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch loan');
    }
  }
);

export const approveLoan = createAsyncThunk(
  'loans/approve',
  async (loanId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`http://loan-service.local/loans/requests/${loanId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve loan');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to approve loan');
    }
  }
);

export const rejectLoan = createAsyncThunk(
  'loans/reject',
  async (loanId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`http://loan-service.local/loans/requests/${loanId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.auth.token}`,
        },
        body: JSON.stringify({ reason: 'Rejected by user' }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject loan');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to reject loan');
    }
  }
);

export const reEvaluateLoan = createAsyncThunk(
  'loans/reEvaluate',
  async (loanId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`http://loan-service.local/loans/requests/${loanId}/evaluate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to re-evaluate loan');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to re-evaluate loan');
    }
  }
);

export const fetchLoanStatistics = createAsyncThunk(
  'loans/fetchStatistics',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      
      console.log('Fetching statistics');
      console.log('Token:', state.auth.token ? 'Present' : 'Missing');
      
      const response = await fetch('http://loan-service.local/loans/statistics', {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Statistics response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Statistics error response:', errorText);
        throw new Error(`Failed to fetch statistics: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch statistics');
    }
  }
);

const loanSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    clearCurrentLoan: (state) => {
      state.currentLoan = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLoanStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const loan = state.loans.find(l => l.id === action.payload.id);
      if (loan) {
        loan.status = action.payload.status as 'Pending' | 'Approved' | 'Rejected';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create loan request
      .addCase(createLoanRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLoanRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loans.unshift(action.payload);
        state.currentLoan = action.payload;
      })
      .addCase(createLoanRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch loans
      .addCase(fetchLoans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loans = action.payload;
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch loan by ID
      .addCase(fetchLoanById.fulfilled, (state, action) => {
        state.currentLoan = action.payload;
      })
      // Approve/Reject loan
      .addCase(approveLoan.fulfilled, (state, action) => {
        const index = state.loans.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.loans[index] = action.payload;
        }
        if (state.currentLoan?.id === action.payload.id) {
          state.currentLoan = action.payload;
        }
      })
      .addCase(rejectLoan.fulfilled, (state, action) => {
        const index = state.loans.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.loans[index] = action.payload;
        }
        if (state.currentLoan?.id === action.payload.id) {
          state.currentLoan = action.payload;
        }
      })
      // Re-evaluate loan
      .addCase(reEvaluateLoan.fulfilled, (state, action) => {
        const index = state.loans.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.loans[index] = action.payload;
        }
        if (state.currentLoan?.id === action.payload.id) {
          state.currentLoan = action.payload;
        }
      })
      // Fetch statistics
      .addCase(fetchLoanStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      });
  },
});

export const { clearCurrentLoan, clearError, updateLoanStatus } = loanSlice.actions;
export default loanSlice.reducer;
