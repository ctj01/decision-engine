import React from 'react';
import type { LoanStatistics } from '../../store/slices/loanSlice';

interface StatsGridProps {
  statistics: LoanStatistics | null;
  isLoading: boolean;
}

const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red';
  isLoading: boolean;
}> = ({ title, value, icon, color, isLoading }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${colorClasses[color]}`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                ) : (
                  value
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icons
const CurrencyDollarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StatsGrid: React.FC<StatsGridProps> = ({ statistics, isLoading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Loans"
        value={statistics?.totalLoans || 0}
        icon={<CurrencyDollarIcon />}
        color="blue"
        isLoading={isLoading}
      />
      
      <StatsCard
        title="Approved Loans"
        value={statistics?.approvedLoans || 0}
        icon={<CheckCircleIcon />}
        color="green"
        isLoading={isLoading}
      />
      
      <StatsCard
        title="Pending Loans"
        value={statistics?.pendingLoans || 0}
        icon={<ClockIcon />}
        color="yellow"
        isLoading={isLoading}
      />
      
      <StatsCard
        title="Rejected Loans"
        value={statistics?.rejectedLoans || 0}
        icon={<XCircleIcon />}
        color="red"
        isLoading={isLoading}
      />
      
      <StatsCard
        title="Total Amount"
        value={statistics ? formatCurrency(statistics.totalAmount) : '$0'}
        icon={<CurrencyDollarIcon />}
        color="blue"
        isLoading={isLoading}
      />
      
      <StatsCard
        title="Average Amount"
        value={statistics ? formatCurrency(statistics.averageAmount) : '$0'}
        icon={<CurrencyDollarIcon />}
        color="green"
        isLoading={isLoading}
      />
      
      <StatsCard
        title="Approval Rate"
        value={statistics ? formatPercentage(statistics.approvalRate) : '0%'}
        icon={<CheckCircleIcon />}
        color="green"
        isLoading={isLoading}
      />
    </div>
  );
};

export default StatsGrid;
