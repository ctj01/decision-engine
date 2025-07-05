using LoanService.Application.Services.Loans;
using LoanService.Infrastructure.Data;
using LoanService.Infrastructure.Repository;
using LoanService.Infrastructure.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

namespace LoanService.Api.Extensions
{
    public static class ServiceCollectionExtensions
    {

        public static IServiceCollection AddAuthenticationAndAuthorization(this IServiceCollection services, IConfiguration config)
        {
            services
                .AddAuthentication("Bearer")
                .AddJwtBearer("Bearer", opts =>
                {
                    opts.Authority = config["IdentityServer:Authority"];
                    opts.TokenValidationParameters.ValidateAudience = false;
                    opts.RequireHttpsMetadata = false; // For development purposes only
                });

            services.AddAuthorization(opts =>
            {
                opts.AddPolicy("LoanApi", policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.RequireClaim("scope", "loan.request");
                });
            });

            return services;
        }

        public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services, IConfiguration config)
        {
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Loan API", Version = "v1" });

                var authority = config["IdentityServer:Authority"]!.TrimEnd('/');
                var oauth = new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.OAuth2,
                    Flows = new OpenApiOAuthFlows
                    {
                        AuthorizationCode = new OpenApiOAuthFlow
                        {
                            AuthorizationUrl = new Uri($"{authority}/connect/authorize"),
                            TokenUrl = new Uri($"{authority}/connect/token"),
                            Scopes = new Dictionary<string, string>
                            {
                                ["loan.request"] = "Request loans"
                            }
                        }
                    }
                };
                c.AddSecurityDefinition("oauth2", oauth);
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    [ oauth ] = new[] { "loan.request" }
                });
            });

            return services;
        }
        public static WebApplication UseSwaggerWithUi(this WebApplication app)
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Loan API V1");
                c.OAuthClientId("loan-service-client");
                c.OAuthUsePkce();
                c.OAuthScopes("loan.request");
            });
            return app;
        }

        public static WebApplication MapLoanEndpoints(this WebApplication app)
        {
            var loans = app.MapGroup("/loans")
                .RequireAuthorization("LoanApi");

            // GET /loans
            loans.MapGet("/", async (ILoanService loanSvc) =>
                    Results.Ok(await loanSvc.GetAllLoansAsync()))
                .WithName("GetLoans");

            // GET /loans/{id}
            loans.MapGet("/{id:guid}", async (ILoanService loanSvc, Guid id) =>
                {
                    var loan = await loanSvc.GetLoanByIdAsync(id);
                    return loan is not null
                        ? Results.Ok(loan)
                        : Results.NotFound();
                })
                .WithName("GetLoanById");

            return app;
        }
            
    }
}
