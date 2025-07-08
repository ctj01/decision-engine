using LoanService.Api.Extensions;
using LoanService.Application.Consumers;
using LoanService.Application.Extensions;
using LoanService.Infrastructure.Extensions;
using MassTransit;

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

app.Run();