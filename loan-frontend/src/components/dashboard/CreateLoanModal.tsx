import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { createLoanRequest } from '../../store/slices/loanSlice';

interface CreateLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateLoanModal: React.FC<CreateLoanModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    amount: '',
    purpose: '',
    creditScore: '',
    monthlyIncome: '',
    employmentStatus: '',
    existingDebts: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const loanRequest = {
        customerId: formData.customerId,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        creditScore: parseInt(formData.creditScore),
        monthlyIncome: parseFloat(formData.monthlyIncome),
        employmentStatus: formData.employmentStatus,
        existingDebts: parseFloat(formData.existingDebts)
      };

      await dispatch(createLoanRequest(loanRequest)).unwrap();
      
      // Reset form and close modal
      setFormData({
        customerId: '',
        amount: '',
        purpose: '',
        creditScore: '',
        monthlyIncome: '',
        employmentStatus: '',
        existingDebts: ''
      });
      onClose();
    } catch (error) {
      console.error('Failed to create loan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal positioning */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Create New Loan Request
                    </h3>
                    <button
                      type="button"
                      onClick={onClose}
                      className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                        Customer ID
                      </label>
                      <input
                        type="text"
                        id="customerId"
                        name="customerId"
                        required
                        value={formData.customerId}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter customer ID"
                      />
                    </div>

                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Loan Amount ($)
                      </label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        required
                        min="1000"
                        max="1000000"
                        step="100"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter loan amount"
                      />
                    </div>

                    <div>
                      <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                        Loan Purpose
                      </label>
                      <select
                        id="purpose"
                        name="purpose"
                        required
                        value={formData.purpose}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="">Select purpose</option>
                        <option value="Home Purchase">Home Purchase</option>
                        <option value="Auto Loan">Auto Loan</option>
                        <option value="Personal">Personal</option>
                        <option value="Business">Business</option>
                        <option value="Education">Education</option>
                        <option value="Debt Consolidation">Debt Consolidation</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="creditScore" className="block text-sm font-medium text-gray-700">
                        Credit Score
                      </label>
                      <input
                        type="number"
                        id="creditScore"
                        name="creditScore"
                        required
                        min="300"
                        max="850"
                        value={formData.creditScore}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter credit score (300-850)"
                      />
                    </div>

                    <div>
                      <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700">
                        Monthly Income ($)
                      </label>
                      <input
                        type="number"
                        id="monthlyIncome"
                        name="monthlyIncome"
                        required
                        min="0"
                        step="100"
                        value={formData.monthlyIncome}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter monthly income"
                      />
                    </div>

                    <div>
                      <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700">
                        Employment Status
                      </label>
                      <select
                        id="employmentStatus"
                        name="employmentStatus"
                        required
                        value={formData.employmentStatus}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="">Select employment status</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Self-employed">Self-employed</option>
                        <option value="Unemployed">Unemployed</option>
                        <option value="Retired">Retired</option>
                        <option value="Student">Student</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="existingDebts" className="block text-sm font-medium text-gray-700">
                        Existing Debts ($)
                      </label>
                      <input
                        type="number"
                        id="existingDebts"
                        name="existingDebts"
                        required
                        min="0"
                        step="100"
                        value={formData.existingDebts}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter existing debts"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Loan Request'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLoanModal;
