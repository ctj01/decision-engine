import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchLoans, fetchLoanStatistics } from '../../store/slices/loanSlice';
import { loanApiService } from '../../services/loanApiService';
import Layout from '../layout/Layout';
import StatsGrid from './StatsGrid';
import LoanRequestsTable from './LoanRequestsTable';
import CreateLoanModal from './CreateLoanModal';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
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

  const handleCreateLoan = () => {
    // Refresh data after loan creation
    dispatch(fetchLoans(undefined));
    dispatch(fetchLoanStatistics());
    setShowCreateForm(false);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Dashboard
            </h1>
            <p className="mt-2 text-base text-gray-600">
              Overview of your loan management system
            </p>
          </div>
          <div className="mt-6 sm:mt-0 sm:flex sm:items-center sm:space-x-4">
            <div className="text-sm text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200">
              Service Status: <span className="font-medium text-green-600">{healthStatus}</span>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors duration-200"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Loan Request
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Statistics Grid */}
      <StatsGrid statistics={statistics} isLoading={isLoading} />

      {/* Recent Loan Requests */}
      <div className="mt-12">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h2 className="text-xl font-semibold leading-6 text-gray-900">Recent Loan Requests</h2>
            <p className="mt-2 text-base text-gray-600">
              A list of all pending loan requests that require attention.
            </p>
          </div>
        </div>
        <LoanRequestsTable loans={loans} isLoading={isLoading} />
      </div>

      {/* Create Loan Modal */}
      {showCreateForm && (
        <CreateLoanModal
          isOpen={showCreateForm}
          onClose={handleCreateLoan}
        />
      )}
    </Layout>
  );
};

export default DashboardPage;
