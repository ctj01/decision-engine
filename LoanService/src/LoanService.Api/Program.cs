using LoanService.Api.Extensions;
using LoanService.Application.Extensions;
using LoanService.Infrastructure.Extensions;
using LoanService.Infrastructure.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddPersistence(builder.Configuration)                 // infra
    .AddApplicationServices()                              // app logic
    .AddAuthenticationAndAuthorization(builder.Configuration)  // API concerns
    .AddSwaggerDocumentation(builder.Configuration);          // API concerns

var app = builder.Build();


app.UseSwaggerWithUi();

if (!builder.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseAuthentication()
    .UseAuthorization();

app.MapLoanEndpoints();                                    // minimal endpoints
app.Run();