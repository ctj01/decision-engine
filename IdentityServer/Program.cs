using IdentityServer;
using IdentityServer.Data;
using IdentityServer.Dto;
using IdentityServer.Services;
using MassTransit;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1) CORS policy
builder.Services.AddCors(o =>
{
    o.AddPolicy("AllowFrontend", p =>
        p.WithOrigins("http://localhost:5174")
         .AllowAnyHeader()
         .AllowAnyMethod());
});

// 2) EF Core + ASP.NET Identity
builder.Services.AddDbContext<ApplicationDbContext>(opts =>
    opts.UseSqlServer(builder.Configuration.GetConnectionString("AuthDb")));
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(opts =>
    {
        opts.Password.RequireDigit = true;
        opts.Password.RequiredLength = 6;
        opts.Password.RequireNonAlphanumeric = false;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// 3) Duende IdentityServer
builder.Services.AddIdentityServer()
    .AddAspNetIdentity<ApplicationUser>()
    .AddInMemoryClients(Config.Clients)
    .AddInMemoryApiScopes(Config.ApiScopes)
    .AddInMemoryIdentityResources(Config.IdentityResources)
    .AddDeveloperSigningCredential();

// 4) AuthZ + MassTransit
builder.Services.AddAuthorization();
builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((ctx, cfg) =>
        cfg.Host(builder.Configuration["RabbitMq:Uri"]));
});

var app = builder.Build();

// ───────────────────────────────────────────────
//  MIDDLEWARE ORDER
// ───────────────────────────────────────────────

app.UseRouting();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseIdentityServer();
app.UseAuthorization();

// ───────────────────────────────────────────────
//  ENDPOINTS
// ───────────────────────────────────────────────

// 1) Preflight OPTIONS for register
app.MapMethods("/api/account/register",
               new[] { "OPTIONS" },
               () => Results.Ok())
   .AllowAnonymous();

// 2) Actual registration POST
app.MapPost("/api/account/register",
    async ([FromServices] IAccountService svc, [FromBody] RegisterDto dto) =>
    {
        var resp = await svc.RegisterAsync(dto);
        return resp.Success
            ? Results.Ok(resp)
            : Results.BadRequest(resp);
    })
   .AllowAnonymous();

app.Run();
