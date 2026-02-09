using FeedbackSystem.API.DTOs;
using FeedbackSystem.API.Entities;
using FeedbackSystem.API.Repositories;
using FeedbackSystem.API.Security;

namespace FeedbackSystem.API.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repo;

    public UserService(IUserRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<UserReadDto>> GetAllAsync(CancellationToken ct = default)
    {
        var users = await _repo.GetAllAsync(ct);
        return users.Select(u => new UserReadDto(
            u.UserId,
            u.FullName,
            u.Email,
            u.Role.RoleName,
            u.IsActive,
            u.CreatedAt
        )).ToList();
    }

    public async Task<UserReadDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var user = await _repo.GetByIdAsync(id, ct);
        if (user is null) return null;
        
        return new UserReadDto(
            user.UserId,
            user.FullName,
            user.Email,
            user.Role.RoleName,
            user.IsActive,
            user.CreatedAt
        );
    }

    public async Task<UserReadDto> CreateAsync(UserCreateDto dto, CancellationToken ct = default)
    {
        if (await _repo.EmailExistsAsync(dto.Email, ct))
            throw new InvalidOperationException("Email already exists.");

        var role = await _repo.GetRoleByNameAsync(dto.RoleName, ct)
                   ?? throw new InvalidOperationException("Role not found.");

        var entity = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = PasswordHasher.Hash(dto.Password),
            RoleId = role.RoleId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(entity, ct);
        entity = await _repo.GetByIdAsync(entity.UserId, ct) ?? entity;
        
        return new UserReadDto(
            entity.UserId,
            entity.FullName,
            entity.Email,
            entity.Role.RoleName,
            entity.IsActive,
            entity.CreatedAt
        );
    }

    public async Task<bool> UpdateAsync(int id, UserUpdateDto dto, CancellationToken ct = default)
    {
        var user = await _repo.GetByIdAsync(id, ct);
        if (user is null) return false;

        var role = await _repo.GetRoleByNameAsync(dto.RoleName, ct)
                   ?? throw new InvalidOperationException("Role not found.");

        user.FullName = dto.FullName;
        user.RoleId = role.RoleId;
        user.IsActive = dto.IsActive;

        await _repo.UpdateAsync(user, ct);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var user = await _repo.GetByIdAsync(id, ct);
        if (user is null) return false;

        await _repo.DeleteAsync(user, ct);
        return true;
    }
}