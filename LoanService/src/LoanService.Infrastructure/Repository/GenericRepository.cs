using LoanService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LoanService.Infrastructure.Repository;

public class GenericRepository<TEntity> : IGenericRepository<TEntity> where TEntity : class
{
    protected readonly LoanDbContext _ctx;
    public GenericRepository(LoanDbContext ctx) => _ctx = ctx;

    public async Task<TEntity?> GetByIdAsync(Guid id) =>
        await _ctx.Set<TEntity>().FindAsync(id);

    public async Task<IEnumerable<TEntity>> GetAllAsync() =>
        await _ctx.Set<TEntity>().ToListAsync();

    public async Task AddAsync(TEntity entity) =>
        await _ctx.Set<TEntity>().AddAsync(entity);

    public void Update(TEntity entity) =>
        _ctx.Set<TEntity>().Update(entity);

    public void Remove(TEntity entity) =>
        _ctx.Set<TEntity>().Remove(entity);

    public IQueryable<TEntity> Query() =>
        _ctx.Set<TEntity>().AsQueryable();
}