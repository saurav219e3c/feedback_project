using FeedbackSystem.API.DTOs;

namespace FeedbackSystem.API.Services;

public interface IUserService
{
    Task<List<UserReadDto>> GetAllAsync(CancellationToken ct = default);
    Task<UserReadDto?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<UserReadDto> CreateAsync(UserCreateDto dto, CancellationToken ct = default);
    Task<bool> UpdateAsync(string id, UserUpdateDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);
    
    // ✅ Statistics
    Task<UserStatsDto> GetStatsAsync(CancellationToken ct = default);
    
    // ✅ Search
    Task<List<UserReadDto>> SearchAsync(string query, CancellationToken ct = default);
}
