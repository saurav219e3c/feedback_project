using FeedbackSystem.API.Data;
using FeedbackSystem.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace FeedbackSystem.API.Repositories
{
    public class BadgeRepository : IBadgeRepository
    {
        private readonly AppDbContext _db;

        public BadgeRepository(AppDbContext db) => _db = db;

        public Task<Badge?> GetByIdAsync(string badgeId, CancellationToken ct = default)
        {
            return _db.Badges
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.BadgeId == badgeId, ct);
        }

        public async Task<(IReadOnlyList<Badge> Items, int Total)> GetAllAsync(
            bool? isActive, string? search, int page, int pageSize, CancellationToken ct = default)
        {
            var query = _db.Badges.AsNoTracking().AsQueryable();

            if (isActive.HasValue)
                query = query.Where(b => b.IsActive == isActive.Value);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(b =>
                    b.BadgeName.Contains(term) ||
                    (b.Description != null && b.Description.Contains(term)));
            }

            var total = await query.CountAsync(ct);

            var items = await query
                .OrderBy(b => b.BadgeName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, total);
        }

        public Task<bool> ExistsAsync(string badgeId, CancellationToken ct = default)
        {
            return _db.Badges.AnyAsync(b => b.BadgeId == badgeId, ct);
        }

        public Task<bool> BadgeNameExistsAsync(string badgeName, string? excludeBadgeId, CancellationToken ct = default)
        {
            var query = _db.Badges.Where(b => b.BadgeName == badgeName);

            if (!string.IsNullOrWhiteSpace(excludeBadgeId))
                query = query.Where(b => b.BadgeId != excludeBadgeId);

            return query.AnyAsync(ct);
        }

        public async Task<Badge> AddAsync(Badge entity, CancellationToken ct = default)
        {
            _db.Badges.Add(entity);
            await _db.SaveChangesAsync(ct);
            return entity;
        }

        public async Task UpdateAsync(Badge entity, CancellationToken ct = default)
        {
            _db.Badges.Update(entity);
            await _db.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(Badge entity, CancellationToken ct = default)
        {
            _db.Badges.Remove(entity);
            await _db.SaveChangesAsync(ct);
        }

        public Task<bool> IsInUseAsync(string badgeId, CancellationToken ct = default)
        {
            return _db.Recognitions.AnyAsync(r => r.BadgeId == badgeId, ct);
        }

        public Task<int> GetTotalCountAsync(CancellationToken ct = default)
        {
            return _db.Badges.CountAsync(ct);
        }
    }
}
