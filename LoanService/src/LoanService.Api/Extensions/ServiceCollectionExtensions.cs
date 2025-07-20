using LoanService.Application.Services.Loans;
using LoanService.Application.Dto;
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

            // GET /loans - Get all loans
            loans.MapGet("/", async (ILoanService loanSvc) =>
                    Results.Ok(await loanSvc.GetAllLoansAsync()))
                .WithName("GetLoans")
                .WithSummary("Get all loans");

            // GET /loans/{id} - Get loan by ID
            loans.MapGet("/{id:guid}", async (ILoanService loanSvc, Guid id) =>
                {
                    var loan = await loanSvc.GetLoanByIdAsync(id);
                    return loan is not null
                        ? Results.Ok(loan)
                        : Results.NotFound();
                })
                .WithName("GetLoanById")
                .WithSummary("Get loan by ID");

            // GET /loans/customer/{customerId} - Get loans by customer
            loans.MapGet("/customer/{customerId:guid}", async (ILoanService loanSvc, Guid customerId) =>
                    Results.Ok(await loanSvc.GetLoansByCustomerAsync(customerId)))
                .WithName("GetLoansByCustomer")
                .WithSummary("Get all loans for a specific customer");

            // GET /loans/statistics - Get loan statistics
            loans.MapGet("/statistics", async (ILoanService loanSvc) =>
                    Results.Ok(await loanSvc.GetLoanStatisticsAsync()))
                .WithName("GetLoanStatistics")
                .WithSummary("Get comprehensive loan statistics");

            // ————— Loan Requests Endpoints —————
            
            // GET /loans/requests - Get all loan requests
            loans.MapGet("/requests", async (ILoanService loanSvc) =>
                    Results.Ok(await loanSvc.GetAllLoanRequestsAsync()))
                .WithName("GetLoanRequests")
                .WithSummary("Get all loan requests");

            // GET /loans/requests/{id} - Get loan request by ID
            loans.MapGet("/requests/{id:guid}", async (ILoanService loanSvc, Guid id) =>
                {
                    var request = await loanSvc.GetLoanRequestByIdAsync(id);
                    return request is not null
                        ? Results.Ok(request)
                        : Results.NotFound();
                })
                .WithName("GetLoanRequestById")
                .WithSummary("Get loan request by ID");

            // POST /loans/requests - Create new loan request with AI evaluation
            loans.MapPost("/requests", async (ILoanService loanSvc, CreateLoanRequestDto request) =>
                {
                    try
                    {
                        var result = await loanSvc.CreateLoanRequestAsync(request);
                        return Results.Created($"/loans/requests/{result.Id}", result);
                    }
                    catch (ArgumentException ex)
                    {
                        return Results.BadRequest(ex.Message);
                    }
                    catch (Exception ex)
                    {
                        return Results.Problem($"Internal server error: {ex.Message}");
                    }
                })
                .WithName("CreateLoanRequest")
                .WithSummary("Create new loan request with AI evaluation");

            // POST /loans/requests/{id}/evaluate - Evaluate loan request
            loans.MapPost("/requests/{id:guid}/evaluate", async (ILoanService loanSvc, Guid id) =>
                {
                    try
                    {
                        var result = await loanSvc.EvaluateLoanRequestAsync(id);
                        return Results.Ok(result);
                    }
                    catch (ArgumentException ex)
                    {
                        return Results.BadRequest(ex.Message);
                    }
                })
                .WithName("EvaluateLoanRequest")
                .WithSummary("Evaluate loan request with AI");

            // POST /loans/requests/{id}/approve - Approve loan request
            loans.MapPost("/requests/{id:guid}/approve", async (ILoanService loanSvc, Guid id) =>
                {
                    try
                    {
                        var result = await loanSvc.ApproveLoanRequestAsync(id);
                        return Results.Ok(result);
                    }
                    catch (ArgumentException ex)
                    {
                        return Results.BadRequest(ex.Message);
                    }
                })
                .WithName("ApproveLoanRequest")
                .WithSummary("Approve a loan request");

            // POST /loans/requests/{id}/reject - Reject loan request
            loans.MapPost("/requests/{id:guid}/reject", async (ILoanService loanSvc, Guid id, RejectLoanRequestDto rejectDto) =>
                {
                    try
                    {
                        var result = await loanSvc.RejectLoanRequestAsync(id, rejectDto.Reason);
                        return Results.Ok(result);
                    }
                    catch (ArgumentException ex)
                    {
                        return Results.BadRequest(ex.Message);
                    }
                })
                .WithName("RejectLoanRequest")
                .WithSummary("Reject a loan request with reason");

            // GET /loans/requests/customer/{customerId} - Get loan requests by customer
            loans.MapGet("/requests/customer/{customerId:guid}", async (ILoanService loanSvc, Guid customerId) =>
                    Results.Ok(await loanSvc.GetLoanRequestsByCustomerAsync(customerId)))
                .WithName("GetLoanRequestsByCustomer")
                .WithSummary("Get all loan requests for a specific customer");

            // GET /loans/requests/status/{status} - Get loan requests by status
            loans.MapGet("/requests/status/{status}", async (ILoanService loanSvc, string status) =>
                    Results.Ok(await loanSvc.GetLoanRequestsByStatusAsync(status)))
                .WithName("GetLoanRequestsByStatus")
                .WithSummary("Get loan requests by status (pending, approved, rejected)");

            return app;
        }          
    }
}
