using FeedbackSystem.API.DTOs;

namespace FeedbackSystem.API.Services;

public interface ICategoryService
{
    Task<List<CategoryReadDto>> GetAllAsync(CancellationToken ct = default);
    Task<CategoryReadDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<CategoryReadDto> CreateAsync(CategoryCreateDto dto, CancellationToken ct = default);
    Task<bool> UpdateAsync(int id, CategoryUpdateDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}