using LoanService.Core;

namespace LoanService.Application.Services.Loans;

public interface ILoanService
{
    public interface ILoanService
    {
        Task<IEnumerable<Loan>> GetAllLoansAsync();
        Task<Loan?> GetLoanByIdAsync(Guid loanId);
        Task<LoanRequest> CreateLoanRequestAsync(Guid customerId, decimal amount, int termMonths);
        Task<Loan> ApproveLoanRequestAsync(Guid loanRequestId);
        Task<bool> CancelLoanAsync(Guid loanId);
    }
}