using System.ComponentModel.DataAnnotations;

namespace FeedbackSystem.API.DTOs;

//MANAGER REGISTER RESPONSE  
public record UserReadDto(
    string UserId, string FullName, string Email, string? Phone, string Role, string DepartmentId, string DepartmentName, bool IsActive, DateTime CreatedAt
);

// REGISTER USER 
public record UserCreateDto(
    [Required, StringLength(20)] string UserId,
    [Required, StringLength(50)] string FullName,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    [Required] string RoleName,
    [Required] string DepartmentId
);

public record UserUpdateDto(
    [Required, StringLength(50)] string FullName,
    [Required] string RoleName,
    [Required] string DepartmentId,
    bool IsActive
);

// Profile update RESPONSE FOR EMPLOYEE/MANAGER
public record ProfileUpdateDto(
    [Required, StringLength(50)] string FullName,
    [Required, EmailAddress] string Email,
    [StringLength(10, MinimumLength = 10, ErrorMessage = "Phone must be exactly 10 digits")] 
    [RegularExpression(@"^\d{10}$", ErrorMessage = "Phone must contain only digits")]
    string? Phone
);


//UPDATE PROFILE 
public record ProfileReadDto(
    string UserId,
    string FullName,
    string Email,
    string? Phone,
    string Role,
    string DepartmentId,
    string DepartmentName,
    DateTime CreatedAt
);

// USER STATS 
public record UserStatsDto(
    int TotalUsers,
    int ActiveUsers,
    int InactiveUsers,
    int TotalFeedbacks,
    int TotalRecognitions
);
