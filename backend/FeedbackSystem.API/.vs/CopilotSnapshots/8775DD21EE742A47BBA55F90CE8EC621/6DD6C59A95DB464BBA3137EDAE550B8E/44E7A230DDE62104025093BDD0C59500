using System.ComponentModel.DataAnnotations;

namespace FeedbackSystem.API.DTOs;

public record UserReadDto(
    int UserId, string FullName, string Email, string Role, bool IsActive, DateTime CreatedAt
);

public record UserCreateDto(
    [Required, StringLength(50)] string FullName,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    [Required] string RoleName
);

public record UserUpdateDto(
    [Required, StringLength(50)] string FullName,
    [Required] string RoleName,
    bool IsActive
);