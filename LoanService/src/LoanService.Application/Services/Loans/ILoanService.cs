using LoanService.Core;
using LoanService.Application.Dto;

namespace LoanService.Application.Services.Loans;

public interface ILoanService
{
    // ————— Consultas —————
    public Task<IEnumerable<Loan>> GetAllLoansAsync();
    public Task<Loan?> GetLoanByIdAsync(Guid loanId);
    public Task<IEnumerable<LoanRequest>> GetAllLoanRequestsAsync();
    public Task<LoanRequest?> GetLoanRequestByIdAsync(Guid requestId);
    public Task<IEnumerable<LoanRequest>> GetLoanRequestsByCustomerAsync(Guid customerId);
    public Task<IEnumerable<Loan>> GetLoansByCustomerAsync(Guid customerId);
    
    // ————— Gestión de Solicitudes —————
    public Task<LoanRequestResponseDto> CreateLoanRequestAsync(CreateLoanRequestDto request);
    public Task<LoanRequestResponseDto> EvaluateLoanRequestAsync(Guid loanRequestId);
    public Task<Loan> ApproveLoanRequestAsync(Guid loanRequestId, string? notes = null);
    public Task<LoanRequest> RejectLoanRequestAsync(Guid loanRequestId, string reason);
    
    // ————— Gestión de Préstamos —————
    public Task<bool> CancelLoanAsync(Guid loanId);
    public Task<LoanStatusDto> GetLoanStatusAsync(Guid loanId);
    
    // ————— Estadísticas —————
    public Task<LoanStatisticsDto> GetLoanStatisticsAsync();
    public Task<IEnumerable<LoanRequest>> GetLoanRequestsByStatusAsync(string status);
}