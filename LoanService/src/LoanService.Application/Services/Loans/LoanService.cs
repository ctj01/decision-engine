using LoanService.Core;
using LoanService.Infrastructure.UnitOfWork;

namespace LoanService.Application.Services.Loans;

public class LoanService : ILoanService
    {
        private readonly IUnitOfWork _uow;

        public LoanService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<LoanRequest> CreateLoanRequestAsync(Guid customerId, decimal amount, int termMonths)
        {
            var request = new LoanRequest
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                Amount = amount,
                TermMonths = termMonths,
                Status = "Pending",
                RequestDate = DateTime.UtcNow
            };
            await _uow.LoanRequests.AddAsync(request);
            await _uow.SaveChangesAsync();
            return request;
        }

        public async Task<IEnumerable<Loan>> GetAllLoansAsync()
        {
            return await _uow.Loans.GetAllAsync();
        }

        public async Task<Loan?> GetLoanByIdAsync(Guid loanId)
        {
            return await _uow.Loans.GetByIdAsync(loanId);
        }

        public async Task<Loan> ApproveLoanRequestAsync(Guid loanRequestId)
        {
            var req = await _uow.LoanRequests.GetByIdAsync(loanRequestId)
                      ?? throw new InvalidOperationException("Loan request not found");

            if (req.Status != "Pending")
                throw new InvalidOperationException("Only pending requests can be approved");

            req.Status = "Approved";
            _uow.LoanRequests.Update(req);

            var loan = new Loan
            {
                Id = Guid.NewGuid(),
                CustomerId = req.CustomerId,
                LoanRequestId = req.Id,
                Principal = req.Amount,
                InterestRate = 5.0m, // Example interest rate
                TermMonths = req.TermMonths,
                StartDate = DateTime.UtcNow,
                Status = "Active"
            };
            await _uow.Loans.AddAsync(loan);

            await _uow.SaveChangesAsync();
            return loan;
        }

        public async Task<bool> CancelLoanAsync(Guid loanId)
        {
            var loan = await _uow.Loans.GetByIdAsync(loanId);
            if (loan == null || loan.Status != "Active")
                return false;

            loan.Status = "Cancelled";
            _uow.Loans.Update(loan);
            await _uow.SaveChangesAsync();
            return true;
        }
    }