using FeedbackSystem.API.DTOs;

namespace FeedbackSystem.API.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginRequestDto dto, CancellationToken ct = default);
    Task<UserReadDto> RegisterAsync(RegisterUserDto dto, CancellationToken ct = default);
}