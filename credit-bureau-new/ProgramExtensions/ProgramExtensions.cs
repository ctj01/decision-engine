using credit_bureau_new.Services.ClientService;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace credit_bureau_new.ProgramExtensions
{
    public static class ProgramExtensions
    {
        public static WebApplicationBuilder ConfigureLogging(this WebApplicationBuilder builder)
        {
            builder.Logging.ClearProviders();
            builder.Logging.AddConsole();
            return builder;
        }

        public static WebApplicationBuilder AddCreditBureauAuthentication(this WebApplicationBuilder builder)
        {
            builder.Services.AddAuthentication("Bearer")
                .AddJwtBearer("Bearer", options =>
                {
                    options.Authority = builder.Configuration["IdentityServerUrl"];
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateAudience = false
                    };
                });

            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("CreditReadScope", policy =>
                    policy.RequireAuthenticatedUser()
                          .RequireClaim("scope", "credit.read"));
            });

            return builder;
        }

        public static WebApplicationBuilder AddCreditBureauServices(this WebApplicationBuilder builder)
        {
            builder.Services.AddScoped<IClientService, ClientService>();
            builder.Services.AddControllers();
            return builder;
        }

        public static WebApplicationBuilder AddSwaggerDocumentation(this WebApplicationBuilder builder)
        {
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Credit-Bureau API",
                    Version = "v1"
                });
                
                var securityScheme = new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter 'Bearer' [space] and then your valid token in the text input below.\nExample: 'Bearer abcde12345'"
                };
                c.AddSecurityDefinition("Bearer", securityScheme);

                var securityRequirement = new OpenApiSecurityRequirement
                {
                    {
                        securityScheme,
                        new[] { "credit.read" }
                    }
                };
                c.AddSecurityRequirement(securityRequirement);
            });
            
            
            return builder;
        }

        public static WebApplication UseCreditBureauPipeline(this WebApplication app)
        {
            // Swagger UI and JSON
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Credit-Bureau API v1");
                c.RoutePrefix = string.Empty;
            });

            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            // Health endpoint
            app.MapGet("/", (ILogger<Program> logger) =>
            {
                logger.LogInformation("Health check ping received");
                return Results.Ok("API Credit-Bureau alive!");
            });

            return app;
        }
    }
}



