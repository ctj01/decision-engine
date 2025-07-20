namespace LoanService.Application.Configuration
{
    public class AiServiceOptions
    {
        public const string SectionName = "AiService";
        
        public string BaseUrl { get; set; } = string.Empty;
        public string PredictEndpoint { get; set; } = "/predict";
        public int TimeoutSeconds { get; set; } = 30;
        
        public string GetPredictUrl() => $"{BaseUrl.TrimEnd('/')}{PredictEndpoint}";
    }
}
