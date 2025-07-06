namespace LoanService.Application.Events;

public record UserRegisteredEvent(
    string UserId,
    string FirstName,
    string LastName,
    string Email,
    string IdentificationNumber);