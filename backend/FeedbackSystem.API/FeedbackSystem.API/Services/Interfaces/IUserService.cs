using FeedbackSystem.API.DTOs;

namespace FeedbackSystem.API.Services.Interfaces;

public interface IUserService
{
    //Only For The Admin pupose
    Task<List<UserReadDto>> GetAllAsync(CancellationToken ct = default);
    Task<UserReadDto?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<UserReadDto> CreateAsync(UserCreateDto dto, CancellationToken ct = default);
    Task<bool> UpdateAsync(string id, UserUpdateDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);
    Task<UserStatsDto> GetStatsAsync(CancellationToken ct = default);

    // these are for the employee and manager purpose
    
    // ✅ Search
    Task<List<UserReadDto>> SearchAsync(string query, CancellationToken ct = default);

    // ✅ Profile update or get For Employee and manager
    Task<ProfileReadDto?> GetProfileAsync(string userId, CancellationToken ct = default);
    Task<bool> UpdateProfileAsync(string userId, ProfileUpdateDto dto, CancellationToken ct = default);
}
