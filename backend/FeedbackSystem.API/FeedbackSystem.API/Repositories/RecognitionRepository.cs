using FeedbackSystem.API.Data;
using FeedbackSystem.API.DTOs;
using FeedbackSystem.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace FeedbackSystem.API.Repositories
{
    public class RecognitionRepository : IRecognitionRepository
    {
        private readonly AppDbContext _db;
        public RecognitionRepository(AppDbContext db) => _db = db;

        public Task<int> GetTotalCountAsync(CancellationToken ct)
            => _db.Recognitions.CountAsync(ct);

        public async Task<(IReadOnlyList<RecognitionItemDto> Items, int Total)> GetGivenAsync(
            string userId, DateTime? from, DateTime? to, string? search, int page, int pageSize, CancellationToken ct)
        {
            var q = _db.Recognitions.AsNoTracking().Where(r => r.FromUserId == userId);

            if (from.HasValue) q = q.Where(r => r.CreatedAt >= from.Value);
            if (to.HasValue)   q = q.Where(r => r.CreatedAt <= to.Value);
            if (!string.IsNullOrWhiteSpace(search)) q = q.Where(r => r.Message.Contains(search.Trim()));

            var total = await q.CountAsync(ct);

            var items = await q.OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new RecognitionItemDto(
                    r.RecognitionId,
                    r.FromUserId,
                    r.FromUser.FullName,
                    r.ToUserId,
                    r.ToUser.FullName,
                    r.BadgeId,
                    r.Badge.BadgeName,
                    r.Points,
                    r.Message,
                    r.CreatedAt
                ))
                .ToListAsync(ct);

            return (items, total);
        }

        public async Task<(IReadOnlyList<RecognitionItemDto> Items, int Total)> GetReceivedAsync(
            string userId, DateTime? from, DateTime? to, string? search, int page, int pageSize, CancellationToken ct)
        {
            var q = _db.Recognitions.AsNoTracking().Where(r => r.ToUserId == userId);

            if (from.HasValue) q = q.Where(r => r.CreatedAt >= from.Value);
            if (to.HasValue)   q = q.Where(r => r.CreatedAt <= to.Value);
            if (!string.IsNullOrWhiteSpace(search)) q = q.Where(r => r.Message.Contains(search.Trim()));

            var total = await q.CountAsync(ct);

            var items = await q.OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new RecognitionItemDto(
                    r.RecognitionId,
                    r.FromUserId,
                    r.FromUser.FullName,
                    r.ToUserId,
                    r.ToUser.FullName,
                    r.BadgeId,
                    r.Badge.BadgeName,
                    r.Points,
                    r.Message,
                    r.CreatedAt
                ))
                .ToListAsync(ct);

            return (items, total);
        }

        public async Task<(IReadOnlyList<RecognitionItemDto> Items, int Total)> GetAllAsync(
            DateTime? from, DateTime? to, string? search, string? departmentScopeId,
            string? fromUserId, string? toUserId, int page, int pageSize, CancellationToken ct)
        {
            var q = ApplyAllFilters(from, to, search, departmentScopeId, fromUserId, toUserId);

            var total = await q.CountAsync(ct);

            var items = await q.OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new RecognitionItemDto(
                    r.RecognitionId,
                    r.FromUserId,
                    r.FromUser.FullName,
                    r.ToUserId,
                    r.ToUser.FullName,
                    r.BadgeId,
                    r.Badge.BadgeName,
                    r.Points,
                    r.Message,
                    r.CreatedAt
                ))
                .ToListAsync(ct);

            return (items, total);
        }

        // ✅ Count-only (same filters)
        public Task<int> CountAllAsync(
            DateTime? from, DateTime? to, string? search, string? departmentScopeId,
            string? fromUserId, string? toUserId, CancellationToken ct)
        {
            var q = ApplyAllFilters(from, to, search, departmentScopeId, fromUserId, toUserId);
            return q.CountAsync(ct);
        }

        public async Task<(int Given, int Received, DateTime? LatestGivenAt, DateTime? LatestReceivedAt)> GetSummaryAsync(
            string userId, CancellationToken ct)
        {
            var givenCount = await _db.Recognitions.AsNoTracking().CountAsync(r => r.FromUserId == userId, ct);
            var receivedCount = await _db.Recognitions.AsNoTracking().CountAsync(r => r.ToUserId == userId, ct);

            var latestGivenAt = await _db.Recognitions.AsNoTracking()
                .Where(r => r.FromUserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => (DateTime?)r.CreatedAt)
                .FirstOrDefaultAsync(ct);

            var latestReceivedAt = await _db.Recognitions.AsNoTracking()
                .Where(r => r.ToUserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => (DateTime?)r.CreatedAt)
                .FirstOrDefaultAsync(ct);

            return (givenCount, receivedCount, latestGivenAt, latestReceivedAt);
        }

        // -------------- private helpers --------------
        private IQueryable<Entities.Recognition> ApplyAllFilters(
            DateTime? from, DateTime? to, string? search, string? departmentScopeId,
            string? fromUserId, string? toUserId)
        {
            var q = _db.Recognitions.AsNoTracking().AsQueryable();

            if (from.HasValue) q = q.Where(r => r.CreatedAt >= from.Value);
            if (to.HasValue)   q = q.Where(r => r.CreatedAt <= to.Value);
            if (!string.IsNullOrWhiteSpace(search)) q = q.Where(r => r.Message.Contains(search.Trim()));
            if (!string.IsNullOrWhiteSpace(fromUserId)) q = q.Where(r => r.FromUserId == fromUserId);
            if (!string.IsNullOrWhiteSpace(toUserId))     q = q.Where(r => r.ToUserId == toUserId);

            if (!string.IsNullOrWhiteSpace(departmentScopeId))
            {
                var depId = departmentScopeId;
                q = q.Where(r => r.FromUser.DepartmentId == depId || r.ToUser.DepartmentId == depId);
            }

            return q;
        }

        // ✅ Category statistics
        public async Task<IReadOnlyList<RecognitionBadgeStatsDto>> GetByBadgeAsync(
            DateTime? from, DateTime? to, string? departmentScopeId, string? userId, CancellationToken ct)
        {
            var q = _db.Recognitions.AsNoTracking().AsQueryable();

            if (from.HasValue) q = q.Where(r => r.CreatedAt >= from.Value);
            if (to.HasValue)   q = q.Where(r => r.CreatedAt <= to.Value);

            if (!string.IsNullOrWhiteSpace(departmentScopeId))
            {
                var depId = departmentScopeId;
                q = q.Where(r => r.FromUser.DepartmentId == depId || r.ToUser.DepartmentId == depId);
            }

            if (!string.IsNullOrWhiteSpace(userId))
                q = q.Where(r => r.FromUserId == userId || r.ToUserId == userId);

            return await q
                .GroupBy(r => new { r.BadgeId, r.Badge.BadgeName })
                .Select(g => new RecognitionBadgeStatsDto(
                    g.Key.BadgeId,
                    g.Key.BadgeName,
                    g.Count(),
                    g.Max(r => (DateTime?)r.CreatedAt)
                ))
                .OrderByDescending(s => s.RecognitionCount)
                .ToListAsync(ct);

             
        }

    public async Task<bool> UserExistsAsync(string userId, CancellationToken ct)
    {
      return await _db.Users.AnyAsync(u => u.UserId == userId, ct);
    }

    public async Task<string> GetBadgeNameAsync(string badgeId, CancellationToken ct)
    {
      var badge = await _db.Badges
            .Where(b => b.BadgeId == badgeId)
            .Select(b => b.BadgeName)
            .FirstOrDefaultAsync(ct);

      return badge; // Returns null if n
    }

    

    public async Task AddRecognitionAsync(Recognition recognition, CancellationToken ct)
    {
      await _db.Recognitions.AddAsync(recognition, ct);
      await _db.SaveChangesAsync(ct);
    }

    public async Task<List<Recognition>> GetUserRecognitionsAsync(string userId, string? direction, CancellationToken ct)
    {
      var query = _db.Recognitions
            .AsNoTracking()
            .Include(r => r.FromUser)
            .Include(r => r.ToUser)
            .Include(r => r.Badge)
            .AsQueryable(); // Start building the query

      // Apply filters based on direction
      if (!string.IsNullOrWhiteSpace(direction))
      {
        if (direction.Equals("given", StringComparison.OrdinalIgnoreCase))
          query = query.Where(r => r.FromUserId == userId);
        else if (direction.Equals("received", StringComparison.OrdinalIgnoreCase))
          query = query.Where(r => r.ToUserId == userId);
        else
          throw new ArgumentException("Invalid direction parameter. Use 'given' or 'received'.");
      }
      else
      {
        // If no direction provided, get both given and received
        query = query.Where(r => r.FromUserId == userId || r.ToUserId == userId);
      }

      // Execute the query and return the entities
      return await query
          .OrderByDescending(r => r.CreatedAt)
          .ToListAsync(ct);
    }
  }
}
