using IdentityServer;
using IdentityServer.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AuthDb")));


builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequiredLength = 6;
        options.Password.RequireNonAlphanumeric = false;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();


builder.Services.AddIdentityServer()
    .AddAspNetIdentity<ApplicationUser>()                
    .AddInMemoryClients(Config.Clients)                   
    .AddInMemoryApiScopes(Config.ApiScopes)               
    .AddInMemoryIdentityResources(Config.IdentityResources)
    .AddDeveloperSigningCredential();                     


builder.Services.AddAuthorization();

var app = builder.Build();


app.UseStaticFiles();
app.UseRouting();
using(var scope = app.Services.CreateScope())
{
    await SeedData.InitializeAsync(scope.ServiceProvider);
}
app.UseIdentityServer();   
app.UseAuthorization();


app.Run();