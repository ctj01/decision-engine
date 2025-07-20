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
    /// Purpose of the loan (e.g., "Home improvement", "Debt consolidation").
    /// </summary>
    public string Purpose { get; set; } = string.Empty;
    
    /// <summary>
    /// Additional notes for the loan request.
    /// </summary>
    public string? Notes { get; set; }
    
    // ————— AI Evaluation Fields —————
    /// <summary>
    /// Decision made by the AI system (approve, reject, pending).
    /// </summary>
    public string? AiDecision { get; set; }
    
    /// <summary>
    /// Confidence level of the AI decision (0.0 to 1.0).
    /// </summary>
    public float? AiConfidence { get; set; }
    
    /// <summary>
    /// Reasons provided by the AI for the decision.
    /// </summary>
    public string? AiReasons { get; set; } // JSON array of reasons
    
    /// <summary>
    /// Date when the AI evaluation was performed.
    /// </summary>
    public DateTime? AiEvaluationDate { get; set; }
    
    // ————— Applicant Information for AI —————
    /// <summary>
    /// Applicant's annual salary.
    /// </summary>
    public decimal Salary { get; set; }
    
    /// <summary>
    /// Applicant's age.
    /// </summary>
    public int Age { get; set; }
    
    /// <summary>
    /// Applicant's credit score.
    /// </summary>
    public int CreditScore { get; set; }
    
    /// <summary>
    /// Applicant's total existing debt.
    /// </summary>
    public decimal TotalDebt { get; set; }
    
    /// <summary>
    /// Type of employment (employed, self_employed).
    /// </summary>
    public string EmploymentType { get; set; } = "employed";
    
    /// <summary>
    /// Whether the applicant is reported in credit bureaus.
    /// </summary>
    public bool IsReported { get; set; }
    
    /// <summary>
    /// Payment history data as JSON.
    /// </summary>
    public string? PaymentHistoryJson { get; set; }
}