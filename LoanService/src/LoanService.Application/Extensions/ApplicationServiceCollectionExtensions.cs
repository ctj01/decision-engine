using LoanService.Application.Services.Loans;
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
            services.AddScoped<ILoanService, Services.Loans.LoanService>();
            return services;
        }
        
    }
}