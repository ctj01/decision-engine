using LoanService.Core;
using LoanService.Infrastructure.Data;
using LoanService.Infrastructure.Repository;

namespace LoanService.Infrastructure.UnitOfWork;

public class UnitOfWork : IUnitOfWork
{
    private readonly LoanDbContext _ctx;

    public UnitOfWork(LoanDbContext ctx)
    {
        _ctx = ctx;
        Customers      = new GenericRepository<Customer>(ctx);
        LoanProducts   = new GenericRepository<LoanProduct>(ctx);
        LoanRequests   = new GenericRepository<LoanRequest>(ctx);
        Loans          = new GenericRepository<Loan>(ctx);
        Payments       = new GenericRepository<Payment>(ctx);
    }

    public IGenericRepository<Customer>      Customers      { get; }
    public IGenericRepository<LoanProduct>   LoanProducts   { get; }
    public IGenericRepository<LoanRequest>   LoanRequests   { get; }
    public IGenericRepository<Loan>          Loans          { get; }
    public IGenericRepository<Payment>       Payments       { get; }

    public async Task<int> SaveChangesAsync() =>
        await _ctx.SaveChangesAsync();

    public void Dispose() =>
        _ctx.Dispose();
}