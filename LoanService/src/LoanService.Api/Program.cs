using LoanService.Api.Extensions;
using LoanService.Application.Consumers;
using LoanService.Application.Extensions;
using LoanService.Infrastructure.Extensions;
using LoanService.Infrastructure.Extensions;
using MassTransit;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5174")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services
    .AddPersistence(builder.Configuration)                 // infra
    .AddApplicationServices()                              // app logic
    .AddAuthenticationAndAuthorization(builder.Configuration)  // API concerns
    .AddSwaggerDocumentation(builder.Configuration);          // API concerns
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<UserRegisteredConsumer>();
    x.UsingRabbitMq((ctx, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMq:Uri"]);
        cfg.ReceiveEndpoint("user-registered-queue", e =>
        {
            e.ConfigureConsumer<UserRegisteredConsumer>(ctx);
        });
    });
});
var app = builder.Build();


app.UseSwaggerWithUi();

if (!builder.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseAuthentication()
    .UseAuthorization();

app.MapLoanEndpoints();                 

app.Run();                 