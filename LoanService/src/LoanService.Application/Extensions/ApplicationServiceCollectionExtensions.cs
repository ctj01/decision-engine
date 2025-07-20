using LoanService.Application.Services.Loans;
using LoanService.Application.Services.AI;
using Microsoft.Extensions.DependencyInjection;

namespace LoanService.Application.Extensions
{
    public static class ApplicationServiceCollectionExtensions
    {
        /// <summary>
        /// Registers all services from the Application layer (use‐cases, business logic).
        /// </summary>
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Servicios de negocio
            services.AddScoped<ILoanService, Services.Loans.LoanService>();
            
            // Servicios de integración
            services.AddScoped<IAiDecisionService, AiDecisionService>();
            
            // Cliente HTTP para el servicio de IA
            services.AddHttpClient<IAiDecisionService, AiDecisionService>(client =>
            {
                client.Timeout = TimeSpan.FromSeconds(30);
                client.DefaultRequestHeaders.Add("User-Agent", "LoanService/1.0");
            });
            
            return services;
        }
        
    }
}