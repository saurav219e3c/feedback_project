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
    [Required] string RoleName,
    [Required] int DepartmentId
);

// ✅ Public registration DTO - Role is ignored and forced to Employee
public record PublicRegisterDto(
    [Required, StringLength(50)] string FullName,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    [Required] int DepartmentId
);

public record AuthUserDto(
    int UserId, string FullName, string Email, string Role, int DepartmentId, string DepartmentName, bool IsActive, DateTime CreatedAt
);

public record AuthResponseDto(
    string Token, DateTime ExpiresAt, AuthUserDto User
);
