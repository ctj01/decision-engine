using LoanService.Core;
using LoanService.Infrastructure.UnitOfWork;
using MassTransit;
using Shared.Events;

namespace LoanService.Application.Consumers;

public class UserRegisteredConsumer : IConsumer<UserRegisteredEvent>
{
    private readonly IUnitOfWork _repo;

    public UserRegisteredConsumer(IUnitOfWork repo) => _repo = repo;

    public async Task Consume(ConsumeContext<UserRegisteredEvent> context)
    {
        var msg = context.Message;
        var customer = new Customer
        {
            Id = msg.UserId,
            FirstName = msg.FirstName,
            LastName = msg.LastName,
            FullName = msg.FirstName + " " + msg.LastName,
            Email = msg.Email,
            IdentificationNumber = msg.IdentificationNumber
        };
        await _repo.Customers.AddAsync(customer);
        await _repo.SaveChangesAsync();
    }
}