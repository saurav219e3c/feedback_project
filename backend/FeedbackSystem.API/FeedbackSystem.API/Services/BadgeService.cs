using FeedbackSystem.API.DTOs.Admin;
using FeedbackSystem.API.Entities;
using FeedbackSystem.API.Repositories.Interfaces;
using FeedbackSystem.API.Services.Interfaces;

namespace FeedbackSystem.API.Services
{
    public class BadgeService : IBadgeService
    {
        private readonly IBadgeRepository _repo;

        public BadgeService(IBadgeRepository repo) => _repo = repo;

        // ── helpers ─────────────────────────────────────────────────────────

        private static BadgeDto ToDto(Badge b) =>
            new BadgeDto(b.BadgeId, b.BadgeName, b.Description, b.IconClass, b.IsActive, b.CreatedAt);

        // ── queries ──────────────────────────────────────────────────────────

        public async Task<BadgeDto?> GetByIdAsync(string badgeId, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(badgeId))
                throw new ArgumentException("Badge ID is required.", nameof(badgeId));

            var entity = await _repo.GetByIdAsync(badgeId, ct);
            return entity is null ? null : ToDto(entity);
        }

        public async Task<PagedBadgeResult> GetAllAsync(
            bool? isActive, string? search, int page, int pageSize, CancellationToken ct = default)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var (items, total) = await _repo.GetAllAsync(isActive, search, page, pageSize, ct);
            return new PagedBadgeResult(page, pageSize, total, items.Select(ToDto).ToList());
        }

        public async Task<int> GetTotalCountAsync(CancellationToken ct = default)
        {
            return await _repo.GetTotalCountAsync(ct);
        }

        // ── commands ─────────────────────────────────────────────────────────

        public async Task<BadgeDto> CreateAsync(CreateBadgeDto dto, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(dto.BadgeId))
                throw new ArgumentException("Badge ID is required.");

            if (await _repo.ExistsAsync(dto.BadgeId, ct))
                throw new InvalidOperationException($"Badge with ID '{dto.BadgeId}' already exists.");

            if (await _repo.BadgeNameExistsAsync(dto.BadgeName, null, ct))
                throw new InvalidOperationException($"Badge with name '{dto.BadgeName}' already exists.");

            var entity = new Badge
            {
                BadgeId  = dto.BadgeId.Trim(),
                BadgeName = dto.BadgeName.Trim(),
                Description = dto.Description?.Trim(),
                IconClass = dto.IconClass?.Trim(),
                IsActive  = true,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _repo.AddAsync(entity, ct);
            return ToDto(created);
        }

        public async Task<BadgeDto> UpdateAsync(string badgeId, UpdateBadgeDto dto, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(badgeId))
                throw new ArgumentException("Badge ID is required.", nameof(badgeId));

            var entity = await _repo.GetByIdAsync(badgeId, ct)
                ?? throw new KeyNotFoundException($"Badge with ID '{badgeId}' not found.");

            if (await _repo.BadgeNameExistsAsync(dto.BadgeName, badgeId, ct))
                throw new InvalidOperationException($"Badge with name '{dto.BadgeName}' already exists.");

            entity.BadgeName  = dto.BadgeName.Trim();
            entity.Description = dto.Description?.Trim();
            entity.IconClass  = dto.IconClass?.Trim();
            entity.IsActive   = dto.IsActive;

            await _repo.UpdateAsync(entity, ct);
            return ToDto(entity);
        }

        public async Task DeleteAsync(string badgeId, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(badgeId))
                throw new ArgumentException("Badge ID is required.", nameof(badgeId));

            var entity = await _repo.GetByIdAsync(badgeId, ct)
                ?? throw new KeyNotFoundException($"Badge with ID '{badgeId}' not found.");

            if (await _repo.IsInUseAsync(badgeId, ct))
                throw new InvalidOperationException("Cannot delete a badge that is assigned to existing recognitions.");

            await _repo.DeleteAsync(entity, ct);
        }
    }
}
