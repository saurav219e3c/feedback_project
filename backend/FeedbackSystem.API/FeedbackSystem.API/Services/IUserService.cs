using FeedbackSystem.API.DTOs;

namespace FeedbackSystem.API.Services;

public interface IUserService
{
    Task<List<UserReadDto>> GetAllAsync(CancellationToken ct = default);
    Task<UserReadDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<UserReadDto> CreateAsync(UserCreateDto dto, CancellationToken ct = default);
    Task<bool> UpdateAsync(int id, UserUpdateDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
