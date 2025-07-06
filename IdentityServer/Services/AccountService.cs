using IdentityServer.Data;
using IdentityServer.Dto;
using IdentityServer.Shared.Events;
using MassTransit;
using Microsoft.AspNetCore.Identity;

namespace IdentityServer.Services;

public class AccountService : IAccountService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IPublishEndpoint _publisher;

    public AccountService(
        UserManager<ApplicationUser> userManager,
        IPublishEndpoint publisher)
    {
        _userManager = userManager;
        _publisher = publisher;
    }

    public async Task<ApiResponse<RegisterResultDto>> RegisterAsync(RegisterDto dto)
    {
        if (dto.Password != dto.ConfirmPassword)
            return new(false, "Passwords do not match");

        var user = new ApplicationUser
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            UserName = dto.Email
        };
        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors);
            return new(false, errors);
        }

        var @event = new UserRegisteredEvent(
            user.Id,
            dto.FirstName,
            dto.LastName,
            dto.Email,
            dto.IdentificationNumber);
        await _publisher.Publish(@event);

        var data = new RegisterResultDto { UserId = user.Id, Email = user.Email };
        return new(true, "Registration successful", data);
    }
}