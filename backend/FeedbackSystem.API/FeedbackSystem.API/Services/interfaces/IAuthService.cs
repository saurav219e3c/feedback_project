using FeedbackSystem.API.DTOs;

namespace FeedbackSystem.API.Services.interfaces;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginRequestDto dto, CancellationToken ct = default);
    Task<UserReadDto> RegisterAsync(RegisterUserDto dto, CancellationToken ct = default);
    Task<UserReadDto> PublicRegisterAsync(PublicRegisterDto dto, CancellationToken ct = default);
}