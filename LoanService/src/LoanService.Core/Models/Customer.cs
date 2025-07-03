namespace LoanService.Core;

public class Customer
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string IdentificationNumber { get; set; } = null!; // DNI, SSN, etc.
}