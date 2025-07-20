using LoanService.Application.Dto;
using LoanService.Application.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace LoanService.Application.Services.AI;

/// <summary>
/// Servicio para integración con el motor de decisiones de IA
/// </summary>
public interface IAiDecisionService
{
    Task<AiEvaluationResultDto> EvaluateLoanRequestAsync(CreateLoanRequestDto request);
}

/// <summary>
/// Implementación del servicio de decisiones de IA
/// </summary>
public class AiDecisionService : IAiDecisionService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AiDecisionService> _logger;
    private readonly AiServiceOptions _options;

    public AiDecisionService(
        HttpClient httpClient, 
        ILogger<AiDecisionService> logger,
        IOptions<AiServiceOptions> options)
    {
        _httpClient = httpClient;
        _logger = logger;
        _options = options.Value;
    }

    public async Task<AiEvaluationResultDto> EvaluateLoanRequestAsync(CreateLoanRequestDto request)
    {
        try
        {
            // Construir payload para el servicio de IA
            var aiRequest = new
            {
                salary = (double)request.Salary,
                age = request.Age,
                credit_score = request.CreditScore,
                total_debt = (double)request.TotalDebt,
                employment_type = request.EmploymentType,
                is_reported = request.IsReported,
                payment_history = request.PaymentHistory.Select(p => new
                {
                    month = p.Month,
                    status = p.Status
                }).ToList()
            };

            // URL del servicio de IA usando configuración
            var aiServiceUrl = _options.GetPredictUrl();
            var requestJson = JsonSerializer.Serialize(aiRequest);
            var content = new StringContent(requestJson, System.Text.Encoding.UTF8, "application/json");

            _logger.LogInformation("🤖 Evaluating loan request with AI service for Customer {CustomerId}, Amount: {Amount}", 
                request.CustomerId, request.Amount);

            // Llamar al servicio de IA
            var response = await _httpClient.PostAsync(aiServiceUrl, content);

            if (response.IsSuccessStatusCode)
            {
                var responseJson = await response.Content.ReadAsStringAsync();
                var aiResponse = JsonSerializer.Deserialize<AiResponseDto>(responseJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                var result = new AiEvaluationResultDto
                {
                    Decision = aiResponse?.Decision ?? "pending",
                    Confidence = aiResponse?.Confidence ?? 0.5f,
                    Reasons = aiResponse?.Reasons ?? new List<string> { "Error en evaluación" },
                    EvaluationDate = DateTime.UtcNow
                };

                _logger.LogInformation("✅ AI Evaluation completed - Decision: {Decision}, Confidence: {Confidence:P}", 
                    result.Decision, result.Confidence);

                return result;
            }
            else
            {
                _logger.LogError("❌ AI Service returned error: {StatusCode} - {Content}", 
                    response.StatusCode, await response.Content.ReadAsStringAsync());

                return new AiEvaluationResultDto
                {
                    Decision = "pending",
                    Confidence = 0.0f,
                    Reasons = new List<string> { "Error en el servicio de IA - Requiere evaluación manual" },
                    EvaluationDate = DateTime.UtcNow
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error calling AI service for loan evaluation");

            return new AiEvaluationResultDto
            {
                Decision = "pending",
                Confidence = 0.0f,
                Reasons = new List<string> { "Error de conexión con IA - Requiere evaluación manual" },
                EvaluationDate = DateTime.UtcNow
            };
        }
    }
}

/// <summary>
/// DTO para respuesta del servicio de IA
/// </summary>
public class AiResponseDto
{
    public string Decision { get; set; } = string.Empty;
    public float Confidence { get; set; }
    public List<string> Reasons { get; set; } = new();
}

/// <summary>
/// DTO para resultado de evaluación de IA
/// </summary>
public class AiEvaluationResultDto
{
    public string Decision { get; set; } = string.Empty; // approve, reject, pending
    public float Confidence { get; set; }
    public List<string> Reasons { get; set; } = new();
    public DateTime EvaluationDate { get; set; }
}
