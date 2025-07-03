namespace LoanService.Core;

/// <summary>
/// Represents an approved loan.
/// </summary>
public class Loan
{
    /// <summary>
    /// Unique identifier for the loan.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Principal amount of the loan.
    /// </summary>
    public decimal Principal { get; set; }

    /// <summary>
    /// Interest rate applied to the loan (annual percentage).
    /// </summary>
    public decimal InterestRate { get; set; }

    /// <summary>
    /// Term length in months.
    /// </summary>
    public int TermMonths { get; set; }

    /// <summary>
    /// Date when the loan was issued.
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Date when the loan will be fully repaid.
    /// </summary>
    public DateTime EndDate => StartDate.AddMonths(TermMonths);

    /// <summary>
    /// Identifier of the customer holding the loan.
    /// </summary>
    public Guid CustomerId { get; set; }

    /// <summary>
    /// Original request that led to this loan.
    /// </summary>
    public LoanRequest LoanRequest { get; set; }
    
    /// <summary>
    /// Loan Request identifier.
    /// </summary>
    public Guid LoanRequestId { get; set; }
    
    /// <summary>
    ///  Customer who holds the loan.
    /// </summary>
    public Customer Customer { get; set; } = null!;

    /// <summary>
    /// Current status of the loan (e.g., Pending, Active, Closed).
    /// </summary>
    public string Status { get; set; } = string.Empty;
    
    }