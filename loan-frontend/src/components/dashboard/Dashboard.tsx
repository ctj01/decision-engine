import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchLoans, fetchLoanStatistics, createLoanRequest } from '../../store/slices/loanSlice';
import { logout } from '../../store/slices/authSlice';
import { loanApiService, type CreateLoanRequestDto } from '../../services/loanApiService';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { loans, statistics, isLoading, error } = useAppSelector((state) => state.loans);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>('Checking...');

  useEffect(() => {
    // Load initial data
    dispatch(fetchLoans(undefined));
    dispatch(fetchLoanStatistics());
    
    // Check service health
    checkHealth();
  }, [dispatch]);

  const checkHealth = async () => {
    try {
      const health = await loanApiService.healthCheck();
      setHealthStatus(`${health.service} - ${health.status}`);
    } catch (error) {
      setHealthStatus('Service unavailable');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleCreateLoan = async (loanData: CreateLoanRequestDto) => {
    try {
      await dispatch(createLoanRequest(loanData)).unwrap();
      setShowCreateForm(false);
      // Refresh data
      dispatch(fetchLoans(undefined));
      dispatch(fetchLoanStatistics());
    } catch (error) {
      console.error('Failed to create loan:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Loan Management Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-500">Service Status: </span>
                <span className={`font-medium ${healthStatus.includes('healthy') ? 'text-green-600' : 'text-red-600'}`}>
                  {healthStatus}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">📊</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Loans</dt>
                      <dd className="text-lg font-medium text-gray-900">{statistics.totalLoans}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                      <span className="text-green-600 font-semibold">✅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                      <dd className="text-lg font-medium text-gray-900">{statistics.approvedLoans}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                      <span className="text-yellow-600 font-semibold">⏳</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                      <dd className="text-lg font-medium text-gray-900">{statistics.pendingLoans}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">📈</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Approval Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">{(statistics.approvalRate * 100).toFixed(1)}%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create New Loan Request
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span>{error}</span>
          </div>
        )}

        {/* Loans Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Loan Requests</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              A list of all loan requests with their current status.
            </p>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading loans...</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {loans.length === 0 ? (
                <li className="px-4 py-4 text-center text-gray-500">No loans found</li>
              ) : (
                loans.slice(0, 10).map((loan) => (
                  <li key={loan.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold
                            ${loan.status === 'Approved' ? 'bg-green-500' : 
                              loan.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                            {loan.status === 'Approved' ? '✓' : loan.status === 'Rejected' ? '✗' : '⏳'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            ${loan.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {loan.purpose} • Customer: {loan.customerId.slice(0, 8)}...
                          </div>
                          {loan.aiScore && (
                            <div className="text-xs text-blue-600">
                              AI Score: {(loan.aiScore * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${loan.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                            loan.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {loan.status}
                        </span>
                        <div className="text-xs text-gray-500">
                          {new Date(loan.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Create Loan Form Modal */}
        {showCreateForm && (
          <CreateLoanForm
            onSubmit={handleCreateLoan}
            onCancel={() => setShowCreateForm(false)}
          />
        )}
      </main>
    </div>
  );
};

// Simple Create Loan Form Component
interface CreateLoanFormProps {
  onSubmit: (data: CreateLoanRequestDto) => void;
  onCancel: () => void;
}

const CreateLoanForm: React.FC<CreateLoanFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateLoanRequestDto>({
    customerId: '',
    amount: 0,
    purpose: '',
    monthlyIncome: 0,
    creditScore: 0,
    employmentStatus: 'Employed',
    existingDebts: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Loan Request</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer ID</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={formData.customerId}
              onChange={(e) => setFormData({...formData, customerId: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              required
              min="1000"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Purpose</label>
            <select
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
            >
              <option value="">Select purpose...</option>
              <option value="Home Purchase">Home Purchase</option>
              <option value="Car Loan">Car Loan</option>
              <option value="Personal">Personal</option>
              <option value="Business">Business</option>
              <option value="Education">Education</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Monthly Income</label>
            <input
              type="number"
              required
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={formData.monthlyIncome}
              onChange={(e) => setFormData({...formData, monthlyIncome: Number(e.target.value)})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Credit Score</label>
            <input
              type="number"
              required
              min="300"
              max="850"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={formData.creditScore}
              onChange={(e) => setFormData({...formData, creditScore: Number(e.target.value)})}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Create Loan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
