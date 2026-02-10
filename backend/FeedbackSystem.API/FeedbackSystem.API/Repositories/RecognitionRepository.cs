using FeedbackSystem.API.Data;
using FeedbackSystem.API.DTOs;
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
            int userId, DateTime? from, DateTime? to, string? search, int page, int pageSize, CancellationToken ct)
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
                    r.CategoryId,
                    r.Category.CategoryName,
                    r.Points,
                    r.Message,
                    r.CreatedAt
                ))
                .ToListAsync(ct);

            return (items, total);
        }

        public async Task<(IReadOnlyList<RecognitionItemDto> Items, int Total)> GetReceivedAsync(
            int userId, DateTime? from, DateTime? to, string? search, int page, int pageSize, CancellationToken ct)
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
                    r.CategoryId,
                    r.Category.CategoryName,
                    r.Points,
                    r.Message,
                    r.CreatedAt
                ))
                .ToListAsync(ct);

            return (items, total);
        }

        public async Task<(IReadOnlyList<RecognitionItemDto> Items, int Total)> GetAllAsync(
            DateTime? from, DateTime? to, string? search, int? departmentScopeId,
            int? fromUserId, int? toUserId, int page, int pageSize, CancellationToken ct)
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
                    r.CategoryId,
                    r.Category.CategoryName,
                    r.Points,
                    r.Message,
                    r.CreatedAt
                ))
                .ToListAsync(ct);

            return (items, total);
        }

        // ✅ Count-only (same filters)
        public Task<int> CountAllAsync(
            DateTime? from, DateTime? to, string? search, int? departmentScopeId,
            int? fromUserId, int? toUserId, CancellationToken ct)
        {
            var q = ApplyAllFilters(from, to, search, departmentScopeId, fromUserId, toUserId);
            return q.CountAsync(ct);
        }

        public async Task<(int Given, int Received, DateTime? LatestGivenAt, DateTime? LatestReceivedAt)> GetSummaryAsync(
            int userId, CancellationToken ct)
        {
            var givenCountTask = _db.Recognitions.AsNoTracking().CountAsync(r => r.FromUserId == userId, ct);
            var receivedCountTask = _db.Recognitions.AsNoTracking().CountAsync(r => r.ToUserId == userId, ct);

            var latestGivenAtTask = _db.Recognitions.AsNoTracking()
                .Where(r => r.FromUserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => (DateTime?)r.CreatedAt)
                .FirstOrDefaultAsync(ct);

            var latestReceivedAtTask = _db.Recognitions.AsNoTracking()
                .Where(r => r.ToUserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => (DateTime?)r.CreatedAt)
                .FirstOrDefaultAsync(ct);

            await Task.WhenAll(givenCountTask, receivedCountTask, latestGivenAtTask, latestReceivedAtTask);

            return (givenCountTask.Result, receivedCountTask.Result, latestGivenAtTask.Result, latestReceivedAtTask.Result);
        }

        // -------------- private helpers --------------
        private IQueryable<Entities.Recognition> ApplyAllFilters(
            DateTime? from, DateTime? to, string? search, int? departmentScopeId,
            int? fromUserId, int? toUserId)
        {
            var q = _db.Recognitions.AsNoTracking().AsQueryable();

            if (from.HasValue) q = q.Where(r => r.CreatedAt >= from.Value);
            if (to.HasValue)   q = q.Where(r => r.CreatedAt <= to.Value);
            if (!string.IsNullOrWhiteSpace(search)) q = q.Where(r => r.Message.Contains(search.Trim()));
            if (fromUserId.HasValue && fromUserId.Value > 0) q = q.Where(r => r.FromUserId == fromUserId.Value);
            if (toUserId.HasValue && toUserId.Value > 0)     q = q.Where(r => r.ToUserId == toUserId.Value);

            if (departmentScopeId.HasValue && departmentScopeId.Value > 0)
            {
                var depId = departmentScopeId.Value;
                q = q.Where(r => r.FromUser.DepartmentId == depId || r.ToUser.DepartmentId == depId);
            }

            return q;
        }

        // ✅ Category statistics
        public async Task<IReadOnlyList<RecognitionCategoryStatsDto>> GetByCategoryAsync(
            DateTime? from, DateTime? to, int? departmentScopeId, int? userId, CancellationToken ct)
        {
            var q = _db.Recognitions.AsNoTracking().AsQueryable();

            if (from.HasValue) q = q.Where(r => r.CreatedAt >= from.Value);
            if (to.HasValue)   q = q.Where(r => r.CreatedAt <= to.Value);

            if (departmentScopeId.HasValue && departmentScopeId.Value > 0)
            {
                var depId = departmentScopeId.Value;
                q = q.Where(r => r.FromUser.DepartmentId == depId || r.ToUser.DepartmentId == depId);
            }

            if (userId.HasValue)
                q = q.Where(r => r.FromUserId == userId.Value || r.ToUserId == userId.Value);

            return await q
                .GroupBy(r => new { r.CategoryId, r.Category.CategoryName })
                .Select(g => new RecognitionCategoryStatsDto(
                    g.Key.CategoryId,
                    g.Key.CategoryName,
                    g.Count(),
                    g.Max(r => (DateTime?)r.CreatedAt)
                ))
                .OrderByDescending(s => s.RecognitionCount)
                .ToListAsync(ct);
        }
    }
}