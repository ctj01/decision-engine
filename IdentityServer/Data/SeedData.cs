namespace IdentityServer.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        var roleMgr = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userMgr = services.GetRequiredService<UserManager<IdentityUser>>();
        
        if (!await roleMgr.RoleExistsAsync("Admin"))
            await roleMgr.CreateAsync(new IdentityRole("Admin"));
        
        var adminEmail = "admin@tuapp.com";
        var admin = await userMgr.FindByEmailAsync(adminEmail);
        if (admin == null)
        {
            admin = new IdentityUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };
            await userMgr.CreateAsync(admin, "Admin123!");
            await userMgr.AddToRoleAsync(admin, "Admin");
        }
    }
}
