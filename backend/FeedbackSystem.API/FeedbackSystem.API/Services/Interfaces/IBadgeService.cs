using FeedbackSystem.API.DTOs.Admin;

namespace FeedbackSystem.API.Services.Interfaces
{
    public interface IBadgeService
    {
        Task<BadgeDto?> GetByIdAsync(string badgeId, CancellationToken ct = default);
        Task<PagedBadgeResult> GetAllAsync(bool? isActive, string? search, int page, int pageSize, CancellationToken ct = default);
        Task<BadgeDto> CreateAsync(CreateBadgeDto dto, CancellationToken ct = default);
        Task<BadgeDto> UpdateAsync(string badgeId, UpdateBadgeDto dto, CancellationToken ct = default);
        Task DeleteAsync(string badgeId, CancellationToken ct = default);
        Task<int> GetTotalCountAsync(CancellationToken ct = default);
    }
}
