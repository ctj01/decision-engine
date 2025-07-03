using LoanService.Core;
using LoanService.Infrastructure.Repository;

namespace LoanService.Infrastructure.UnitOfWork;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<Customer> Customers { get; }
    IGenericRepository<LoanProduct> LoanProducts { get; }
    IGenericRepository<LoanRequest> LoanRequests { get; }
    IGenericRepository<Loan> Loans { get; }
    IGenericRepository<Payment> Payments { get; }
    Task<int> SaveChangesAsync();
}