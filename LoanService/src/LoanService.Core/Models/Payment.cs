namespace LoanService.Core;

public class Payment
{
    public Guid Id { get; set; }
    public Guid LoanId { get; set; }
    public DateTime DueDate { get; set; }
    public decimal Amount { get; set; }
    public DateTime? PaidDate { get; set; }
    public decimal? PaidAmount { get; set; }
    public Loan Loan { get; set; } = null!;
}