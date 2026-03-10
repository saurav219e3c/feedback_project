using FeedbackSystem.API.Entities;

namespace FeedbackSystem.API.Repositories.Interfaces
{
    public interface IBadgeRepository
    {
        Task<Badge?> GetByIdAsync(string badgeId, CancellationToken ct = default);
        Task<(IReadOnlyList<Badge> Items, int Total)> GetAllAsync(bool? isActive, string? search, int page, int pageSize, CancellationToken ct = default);
        Task<bool> ExistsAsync(string badgeId, CancellationToken ct = default);
        Task<bool> BadgeNameExistsAsync(string badgeName, string? excludeBadgeId, CancellationToken ct = default);
        Task<Badge> AddAsync(Badge entity, CancellationToken ct = default);
        Task UpdateAsync(Badge entity, CancellationToken ct = default);
        Task DeleteAsync(Badge entity, CancellationToken ct = default);
        Task<int> GetTotalCountAsync(CancellationToken ct = default);
        Task<bool> IsInUseAsync(string badgeId, CancellationToken ct = default);
    }
}
