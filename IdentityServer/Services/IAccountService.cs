using IdentityServer.Dto;

namespace IdentityServer.Services;

public interface IAccountService
{
    Task<ApiResponse<RegisterResultDto>> RegisterAsync(RegisterDto dto);
}