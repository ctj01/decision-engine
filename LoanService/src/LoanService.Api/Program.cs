using LoanService.Api.Extensions;
using LoanService.Application.Consumers;
using LoanService.Application.Extensions;
using LoanService.Infrastructure.Extensions;
using MassTransit;
using Prometheus;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .SetIsOriginAllowed(_ => true) 
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services
    .AddPersistence(builder.Configuration)
    .AddApplicationServices()
    .AddAuthenticationAndAuthorization(builder.Configuration)
    .AddSwaggerDocumentation(builder.Configuration);

// 🚀 MassTransit + RabbitMQ con retry y DLQ
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<UserRegisteredConsumer>();

    x.UsingRabbitMq((ctx, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMq:Uri"]);

        cfg.ReceiveEndpoint("user-registered-queue", e =>
        {
            // 1) Consumer
            e.ConfigureConsumer<UserRegisteredConsumer>(ctx);

            // 2) Retry policy: hasta 3 intentos con back-off exponencial
            e.UseMessageRetry(r => r.Exponential(
                retryLimit: 3,
                minInterval: TimeSpan.FromSeconds(1),
                maxInterval: TimeSpan.FromSeconds(10),
                intervalDelta: TimeSpan.FromSeconds(2)
            ));

            // 3) Circuit breaker:  if 3 consecutive failures, pause for 30 seconds
            e.BindDeadLetterQueue("user-registered-queue-dlq");
        });
    });
});

var app = builder.Build();

app.UseRouting();
app.UseCors("AllowFrontend");
app.UseSwaggerWithUi();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapLoanEndpoints();
app.UseHttpMetrics();
app.MapMetrics();
app.Run();
