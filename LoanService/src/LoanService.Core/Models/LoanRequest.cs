namespace LoanService.Core;

using System;

/// <summary>
/// Represents a client's request to open a new loan.
/// </summary>
public class LoanRequest
{
    /// <summary>
    /// Unique identifier for the loan request.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Identifier of the customer making the request.
    /// </summary>
    public Guid CustomerId { get; set; }

    /// <summary>
    /// Amount of money requested.
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Requested term length in months.
    /// </summary>
    public int TermMonths { get; set; }
    
    /// <summary>
    /// Status of the loan request (e.g., Pending, Approved, Rejected).
    /// </summary>
    public string Status { get; set; } = "Pending";

    /// <summary>
    /// Date when the request was submitted.
    /// </summary>
    public DateTime RequestDate { get; set; }
    
    /// <summary>
    /// Customer who made the request.
    /// </summary>
    public Customer Customer { get; set; } = null!;
    /// <summary>
    
    
    }