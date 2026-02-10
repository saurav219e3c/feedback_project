using System.ComponentModel.DataAnnotations;

namespace FeedbackSystem.API.DTOs;

public record CategoryCreateDto(
    [Required, StringLength(100)] string CategoryName,
    [StringLength(225)] string? Description
);

public record CategoryUpdateDto(
    [Required, StringLength(100)] string CategoryName,
    [StringLength(225)] string? Description,
    bool IsActive
);

public record CategoryReadDto(
    int CategoryId,
    string CategoryName,
    string? Description,
    bool IsActive,
    DateTime CreatedAt
);
