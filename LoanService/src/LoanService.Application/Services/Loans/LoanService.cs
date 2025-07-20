using LoanService.Core;
using LoanService.Infrastructure.UnitOfWork;
using LoanService.Application.Dto;
using LoanService.Application.Services.AI;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace LoanService.Application.Services.Loans;

public class LoanService : ILoanService
{
    private readonly IUnitOfWork _uow;
    private readonly IAiDecisionService _aiDecisionService;
    private readonly ILogger<LoanService> _logger;

    public LoanService(
        IUnitOfWork uow, 
        IAiDecisionService aiDecisionService,
        ILogger<LoanService> logger)
    {
        _uow = uow;
        _aiDecisionService = aiDecisionService;
        _logger = logger;
    }

    // ————— Consultas —————
    public async Task<IEnumerable<Loan>> GetAllLoansAsync()
    {
        _logger.LogInformation("📋 Getting all loans");
        return await _uow.Loans.GetAllAsync();
    }

    public async Task<Loan?> GetLoanByIdAsync(Guid loanId)
    {
        _logger.LogInformation("🔍 Getting loan {LoanId}", loanId);
        return await _uow.Loans.GetByIdAsync(loanId);
    }

    public async Task<IEnumerable<LoanRequest>> GetAllLoanRequestsAsync()
    {
        _logger.LogInformation("📋 Getting all loan requests");
        return await _uow.LoanRequests.GetAllAsync();
    }

    public async Task<LoanRequest?> GetLoanRequestByIdAsync(Guid requestId)
    {
        _logger.LogInformation("🔍 Getting loan request {RequestId}", requestId);
        return await _uow.LoanRequests.GetByIdAsync(requestId);
    }

    public async Task<IEnumerable<LoanRequest>> GetLoanRequestsByCustomerAsync(Guid customerId)
    {
        _logger.LogInformation("👤 Getting loan requests for customer {CustomerId}", customerId);
        var allRequests = await _uow.LoanRequests.GetAllAsync();
        return allRequests.Where(r => r.CustomerId == customerId);
    }

    public async Task<IEnumerable<Loan>> GetLoansByCustomerAsync(Guid customerId)
    {
        _logger.LogInformation("👤 Getting loans for customer {CustomerId}", customerId);
        var allLoans = await _uow.Loans.GetAllAsync();
        return allLoans.Where(l => l.CustomerId == customerId);
    }

    // ————— Gestión de Solicitudes —————
    public async Task<LoanRequestResponseDto> CreateLoanRequestAsync(CreateLoanRequestDto request)
    {
        _logger.LogInformation("📝 Creating loan request for customer {CustomerId}, Amount: {Amount}", 
            request.CustomerId, request.Amount);

        try
        {
            // Crear la solicitud de préstamo
            var loanRequest = new LoanRequest
            {
                Id = Guid.NewGuid(),
                CustomerId = request.CustomerId,
                Amount = request.Amount,
                TermMonths = request.TermMonths,
                Status = "Pending",
                RequestDate = DateTime.UtcNow,
                Purpose = request.Purpose,
                Notes = request.Notes,
                
                // Información para evaluación de IA
                Salary = request.Salary,
                Age = request.Age,
                CreditScore = request.CreditScore,
                TotalDebt = request.TotalDebt,
                EmploymentType = request.EmploymentType,
                IsReported = request.IsReported,
                PaymentHistoryJson = JsonSerializer.Serialize(request.PaymentHistory)
            };

            await _uow.LoanRequests.AddAsync(loanRequest);
            await _uow.SaveChangesAsync();

            _logger.LogInformation("✅ Loan request created with ID {RequestId}", loanRequest.Id);

            // Evaluar automáticamente con IA
            var evaluationResult = await EvaluateLoanRequestAsync(loanRequest.Id);

            return evaluationResult;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error creating loan request for customer {CustomerId}", request.CustomerId);
            throw;
        }
    }

    public async Task<LoanRequestResponseDto> EvaluateLoanRequestAsync(Guid loanRequestId)
    {
        _logger.LogInformation("🤖 Evaluating loan request {RequestId}", loanRequestId);

        var loanRequest = await _uow.LoanRequests.GetByIdAsync(loanRequestId)
            ?? throw new InvalidOperationException($"Loan request {loanRequestId} not found");

        try
        {
            // Preparar datos para evaluación de IA
            var createDto = new CreateLoanRequestDto
            {
                CustomerId = loanRequest.CustomerId,
                Amount = loanRequest.Amount,
                TermMonths = loanRequest.TermMonths,
                Purpose = loanRequest.Purpose,
                Salary = loanRequest.Salary,
                Age = loanRequest.Age,
                CreditScore = loanRequest.CreditScore,
                TotalDebt = loanRequest.TotalDebt,
                EmploymentType = loanRequest.EmploymentType,
                IsReported = loanRequest.IsReported,
                PaymentHistory = string.IsNullOrEmpty(loanRequest.PaymentHistoryJson) 
                    ? new List<PaymentHistoryDto>() 
                    : JsonSerializer.Deserialize<List<PaymentHistoryDto>>(loanRequest.PaymentHistoryJson) ?? new()
            };

            // Llamar al servicio de IA
            var aiResult = await _aiDecisionService.EvaluateLoanRequestAsync(createDto);

            // Actualizar la solicitud con el resultado de la IA
            loanRequest.AiDecision = aiResult.Decision;
            loanRequest.AiConfidence = aiResult.Confidence;
            loanRequest.AiReasons = JsonSerializer.Serialize(aiResult.Reasons);
            loanRequest.AiEvaluationDate = aiResult.EvaluationDate;

            // Actualizar estado basado en la decisión de IA
            loanRequest.Status = aiResult.Decision switch
            {
                "approve" => "AI_Approved",
                "reject" => "AI_Rejected", 
                _ => "Pending"
            };

            _uow.LoanRequests.Update(loanRequest);
            await _uow.SaveChangesAsync();

            _logger.LogInformation("✅ Loan request {RequestId} evaluated - Decision: {Decision}, Confidence: {Confidence:P}", 
                loanRequestId, aiResult.Decision, aiResult.Confidence);

            return MapToResponseDto(loanRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error evaluating loan request {RequestId}", loanRequestId);
            
            // En caso de error, marcar como pendiente para revisión manual
            loanRequest.Status = "Pending";
            loanRequest.AiDecision = "error";
            loanRequest.AiConfidence = 0.0f;
            loanRequest.AiReasons = JsonSerializer.Serialize(new[] { "Error en evaluación automática - Requiere revisión manual" });
            loanRequest.AiEvaluationDate = DateTime.UtcNow;
            
            _uow.LoanRequests.Update(loanRequest);
            await _uow.SaveChangesAsync();

            return MapToResponseDto(loanRequest);
        }
    }

    public async Task<Loan> ApproveLoanRequestAsync(Guid loanRequestId, string? notes = null)
    {
        _logger.LogInformation("✅ Approving loan request {RequestId}", loanRequestId);

        var loanRequest = await _uow.LoanRequests.GetByIdAsync(loanRequestId)
            ?? throw new InvalidOperationException($"Loan request {loanRequestId} not found");

        if (loanRequest.Status == "Approved" || loanRequest.Status == "Rejected")
            throw new InvalidOperationException($"Loan request is already {loanRequest.Status.ToLower()}");

        // Actualizar estado de la solicitud
        loanRequest.Status = "Approved";
        _uow.LoanRequests.Update(loanRequest);

        // Crear el préstamo
        var loan = new Loan
        {
            Id = Guid.NewGuid(),
            CustomerId = loanRequest.CustomerId,
            LoanRequestId = loanRequest.Id,
            Principal = loanRequest.Amount,
            InterestRate = CalculateInterestRate(loanRequest),
            TermMonths = loanRequest.TermMonths,
            StartDate = DateTime.UtcNow,
            Status = "Active"
        };

        await _uow.Loans.AddAsync(loan);
        await _uow.SaveChangesAsync();

        _logger.LogInformation("🎉 Loan {LoanId} created for request {RequestId}", loan.Id, loanRequestId);
        return loan;
    }

    public async Task<LoanRequest> RejectLoanRequestAsync(Guid loanRequestId, string reason)
    {
        _logger.LogInformation("❌ Rejecting loan request {RequestId}", loanRequestId);

        var loanRequest = await _uow.LoanRequests.GetByIdAsync(loanRequestId)
            ?? throw new InvalidOperationException($"Loan request {loanRequestId} not found");

        if (loanRequest.Status == "Approved" || loanRequest.Status == "Rejected")
            throw new InvalidOperationException($"Loan request is already {loanRequest.Status.ToLower()}");

        loanRequest.Status = "Rejected";
        loanRequest.Notes = $"{loanRequest.Notes}\nRejection reason: {reason}".Trim();
        
        _uow.LoanRequests.Update(loanRequest);
        await _uow.SaveChangesAsync();

        _logger.LogInformation("❌ Loan request {RequestId} rejected", loanRequestId);
        return loanRequest;
    }

    // ————— Gestión de Préstamos —————
    public async Task<bool> CancelLoanAsync(Guid loanId)
    {
        _logger.LogInformation("🚫 Canceling loan {LoanId}", loanId);

        var loan = await _uow.Loans.GetByIdAsync(loanId);
        if (loan == null || loan.Status != "Active")
        {
            _logger.LogWarning("⚠️ Cannot cancel loan {LoanId} - not found or not active", loanId);
            return false;
        }

        loan.Status = "Cancelled";
        _uow.Loans.Update(loan);
        await _uow.SaveChangesAsync();

        _logger.LogInformation("✅ Loan {LoanId} cancelled", loanId);
        return true;
    }

    public async Task<LoanStatusDto> GetLoanStatusAsync(Guid loanId)
    {
        _logger.LogInformation("📊 Getting status for loan {LoanId}", loanId);

        var loan = await _uow.Loans.GetByIdAsync(loanId)
            ?? throw new InvalidOperationException($"Loan {loanId} not found");

        // TODO: Calcular pagos realizados y balance restante cuando se implemente el sistema de pagos
        return new LoanStatusDto
        {
            LoanId = loan.Id,
            Status = loan.Status,
            Principal = loan.Principal,
            InterestRate = loan.InterestRate,
            TermMonths = loan.TermMonths,
            StartDate = loan.StartDate,
            EndDate = loan.EndDate,
            TotalPaid = 0, // Placeholder
            RemainingBalance = loan.Principal, // Placeholder
            PaymentsMade = 0, // Placeholder
            PaymentsRemaining = loan.TermMonths, // Placeholder
            NextPaymentDate = loan.StartDate.AddMonths(1), // Placeholder
            NextPaymentAmount = CalculateMonthlyPayment(loan.Principal, loan.InterestRate, loan.TermMonths)
        };
    }

    // ————— Estadísticas —————
    public async Task<LoanStatisticsDto> GetLoanStatisticsAsync()
    {
        _logger.LogInformation("📈 Generating loan statistics");

        var allLoans = await _uow.Loans.GetAllAsync();
        var allRequests = await _uow.LoanRequests.GetAllAsync();

        var stats = new LoanStatisticsDto
        {
            TotalLoans = allLoans.Count(),
            ActiveLoans = allLoans.Count(l => l.Status == "Active"),
            CompletedLoans = allLoans.Count(l => l.Status == "Completed"),
            CancelledLoans = allLoans.Count(l => l.Status == "Cancelled"),
            
            PendingRequests = allRequests.Count(r => r.Status == "Pending"),
            ApprovedRequests = allRequests.Count(r => r.Status == "Approved" || r.Status == "AI_Approved"),
            RejectedRequests = allRequests.Count(r => r.Status == "Rejected" || r.Status == "AI_Rejected"),
            
            TotalLoanAmount = allLoans.Sum(l => l.Principal),
            AverageLoanAmount = allLoans.Any() ? allLoans.Average(l => l.Principal) : 0,
            TotalInterestEarned = 0, // TODO: Calcular cuando se implemente sistema de pagos
            
            LoansByStatus = allLoans.GroupBy(l => l.Status).ToDictionary(g => g.Key, g => g.Count()),
            LoansByTerm = allLoans.GroupBy(l => l.TermMonths).ToDictionary(g => g.Key, g => g.Count())
        };

        return stats;
    }

    public async Task<IEnumerable<LoanRequest>> GetLoanRequestsByStatusAsync(string status)
    {
        _logger.LogInformation("📋 Getting loan requests with status {Status}", status);
        var allRequests = await _uow.LoanRequests.GetAllAsync();
        return allRequests.Where(r => r.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
    }

    // ————— Métodos auxiliares —————
    private LoanRequestResponseDto MapToResponseDto(LoanRequest loanRequest)
    {
        return new LoanRequestResponseDto
        {
            Id = loanRequest.Id,
            CustomerId = loanRequest.CustomerId,
            Amount = loanRequest.Amount,
            TermMonths = loanRequest.TermMonths,
            Status = loanRequest.Status,
            RequestDate = loanRequest.RequestDate,
            Purpose = loanRequest.Purpose,
            Notes = loanRequest.Notes,
            AiDecision = loanRequest.AiDecision,
            AiConfidence = loanRequest.AiConfidence,
            AiReasons = string.IsNullOrEmpty(loanRequest.AiReasons) 
                ? new List<string>() 
                : JsonSerializer.Deserialize<List<string>>(loanRequest.AiReasons) ?? new(),
            EvaluationDate = loanRequest.AiEvaluationDate
        };
    }

    private decimal CalculateInterestRate(LoanRequest loanRequest)
    {
        // Calcular tasa de interés basada en la evaluación de IA y otros factores
        decimal baseRate = 5.0m;
        
        if (loanRequest.AiDecision == "approve" && loanRequest.AiConfidence > 0.8f)
            return Math.Max(3.5m, baseRate - 1.0m); // Mejor tasa para clientes de bajo riesgo
        
        if (loanRequest.AiDecision == "pending" || loanRequest.AiConfidence < 0.6f)
            return baseRate + 2.0m; // Tasa más alta para mayor riesgo
            
        return baseRate;
    }

    private decimal CalculateMonthlyPayment(decimal principal, decimal annualRate, int termMonths)
    {
        if (termMonths == 0) return 0;
        
        decimal monthlyRate = annualRate / 100 / 12;
        if (monthlyRate == 0) return principal / termMonths;
        
        return principal * monthlyRate * (decimal)Math.Pow((double)(1 + monthlyRate), termMonths) / 
               ((decimal)Math.Pow((double)(1 + monthlyRate), termMonths) - 1);
    }
}