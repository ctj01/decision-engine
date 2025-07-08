using Duende.IdentityServer;
using IdentityServer;
using IdentityServer.Data;
using IdentityServer.Dto;
using IdentityServer.Services;
using MassTransit;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(o =>
    o.AddPolicy("AllowFrontend", p =>
        p.SetIsOriginAllowed(_ => true)
         .AllowAnyHeader()
         .AllowAnyMethod()));

builder.Services.AddDbContext<ApplicationDbContext>(opts =>
    opts.UseSqlServer(builder.Configuration.GetConnectionString("AuthDb")));
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(opts =>
    {
        opts.Password.RequiredLength = 6;
        opts.Password.RequireNonAlphanumeric = false;
        opts.Password.RequireDigit = true;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddRazorPages();

builder.Services.AddIdentityServer()
    .AddAspNetIdentity<ApplicationUser>()
    .AddInMemoryClients(Config.Clients)
    .AddInMemoryApiScopes(Config.ApiScopes)
    .AddInMemoryIdentityResources(Config.IdentityResources)
    .AddDeveloperSigningCredential();

builder.Services.AddAuthorization();
builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((ctx, cfg) =>
        cfg.Host(builder.Configuration["RabbitMq:Uri"]));
});

var app = builder.Build();

app.UseRouting();
app.UseCors("AllowFrontend");
app.UseStaticFiles();
app.UseAuthentication();
app.UseIdentityServer();
app.UseAuthorization();

app.MapRazorPages();

app.MapMethods("/api/account/register", new[] { "OPTIONS" }, () => Results.Ok())
   .AllowAnonymous();

app.MapPost("/api/account/register",
    async ([FromServices] IAccountService svc, [FromBody] RegisterDto dto) =>
    {
        var resp = await svc.RegisterAsync(dto);
        return resp.Success ? Results.Ok(resp) : Results.BadRequest(resp);
    })
   .AllowAnonymous();

app.Run();
