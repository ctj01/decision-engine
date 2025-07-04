using LoanService.Core;

namespace LoanService.Application.Services.Loans;

public interface ILoanService
{
    public Task<IEnumerable<Loan>> GetAllLoansAsync();
    public Task<Loan?> GetLoanByIdAsync(Guid loanId);
    public Task<LoanRequest> CreateLoanRequestAsync(Guid customerId, decimal amount, int termMonths);
    public Task<Loan> ApproveLoanRequestAsync(Guid loanRequestId);
    public Task<bool> CancelLoanAsync(Guid loanId);
}