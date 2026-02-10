using System.ComponentModel.DataAnnotations;

namespace FeedbackSystem.API.DTOs;

public record DepartmentReadDto(
    int DepartmentId,
    string DepartmentName,
    string? Description,
    bool IsActive,
    DateTime CreatedAt
);

public record DepartmentCreateDto(
    [Required, StringLength(100)] string DepartmentName,
    [StringLength(250)] string? Description
);

public record DepartmentUpdateDto(
    [Required, StringLength(100)] string DepartmentName,
    [StringLength(250)] string? Description,
    bool IsActive
);
