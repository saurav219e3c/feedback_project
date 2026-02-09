using System.ComponentModel.DataAnnotations;

namespace FeedbackSystem.API.DTOs;

public record LoginRequestDto(
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password
);

public record RegisterUserDto(
    [Required, StringLength(50)] string FullName,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    [Required] string RoleName
);

public record AuthUserDto(
    int UserId, string FullName, string Email, string Role, bool IsActive, DateTime CreatedAt
);

public record AuthResponseDto(
    string Token, DateTime ExpiresAt, AuthUserDto User
);
