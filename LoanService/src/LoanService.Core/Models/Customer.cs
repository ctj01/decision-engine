namespace LoanService.Core;

public class Customer
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string FullName = null!;
    public string Email { get; set; } = null!;
    public string IdentificationNumber { get; set; } = null!; // DNI, SSN, etc.
}