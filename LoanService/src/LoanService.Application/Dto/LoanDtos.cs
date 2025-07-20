namespace LoanService.Application.Dto;

/// <summary>
/// DTO para crear una nueva solicitud de préstamo
/// </summary>
public class CreateLoanRequestDto
{
    public Guid CustomerId { get; set; }
    public decimal Amount { get; set; }
    public int TermMonths { get; set; }
    public string Purpose { get; set; } = string.Empty; // Propósito del préstamo
    public string? Notes { get; set; }
    
    // ————— Información del cliente para evaluación —————
    public decimal Salary { get; set; }
    public int Age { get; set; }
    public int CreditScore { get; set; }
    public decimal TotalDebt { get; set; }
    public string EmploymentType { get; set; } = "employed"; // employed, self_employed
    public bool IsReported { get; set; } = false;
    public List<PaymentHistoryDto> PaymentHistory { get; set; } = new();
}

/// <summary>
/// DTO para respuesta de solicitud de préstamo
/// </summary>
public class LoanRequestResponseDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public decimal Amount { get; set; }
    public int TermMonths { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime RequestDate { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    
    // ————— Resultado de evaluación de IA —————
    public string? AiDecision { get; set; }
    public float? AiConfidence { get; set; }
    public List<string> AiReasons { get; set; } = new();
    public DateTime? EvaluationDate { get; set; }
    
    // ————— Información del cliente —————
    public CustomerDto? Customer { get; set; }
}

/// <summary>
/// DTO para historial de pagos
/// </summary>
public class PaymentHistoryDto
{
    public string Month { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // on_time, late, missed
}

/// <summary>
/// DTO para información del cliente
/// </summary>
public class CustomerDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string Email { get; set; } = string.Empty;
    public string IdentificationNumber { get; set; } = string.Empty;
}

/// <summary>
/// DTO para estado de préstamo
/// </summary>
public class LoanStatusDto
{
    public Guid LoanId { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal Principal { get; set; }
    public decimal InterestRate { get; set; }
    public int TermMonths { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal RemainingBalance { get; set; }
    public int PaymentsMade { get; set; }
    public int PaymentsRemaining { get; set; }
    public DateTime? NextPaymentDate { get; set; }
    public decimal NextPaymentAmount { get; set; }
}

/// <summary>
/// DTO para estadísticas de préstamos
/// </summary>
public class LoanStatisticsDto
{
    public int TotalLoans { get; set; }
    public int ActiveLoans { get; set; }
    public int CompletedLoans { get; set; }
    public int CancelledLoans { get; set; }
    
    public int PendingRequests { get; set; }
    public int ApprovedRequests { get; set; }
    public int RejectedRequests { get; set; }
    
    public decimal TotalLoanAmount { get; set; }
    public decimal AverageLoanAmount { get; set; }
    public decimal TotalInterestEarned { get; set; }
    
    public Dictionary<string, int> LoansByStatus { get; set; } = new();
    public Dictionary<int, int> LoansByTerm { get; set; } = new();
    public Dictionary<string, decimal> AmountByPurpose { get; set; } = new();
}

/// <summary>
/// DTO for rejecting a loan request
/// </summary>
public class RejectLoanRequestDto
{
    public string Reason { get; set; } = string.Empty;
}
