using FeedbackSystem.API.DTOs;

namespace FeedbackSystem.API.Repositories
{
    public interface IFeedbackRepository
    {
        Task<(IReadOnlyList<FeedbackItemDto> Items, int Total)> GetGivenAsync(
            int userId, DateTime? from, DateTime? to, int? categoryId, string? search, int page, int pageSize, CancellationToken ct);

        Task<(IReadOnlyList<FeedbackItemDto> Items, int Total)> GetReceivedAsync(
            int userId, DateTime? from, DateTime? to, int? categoryId, string? search, int page, int pageSize, CancellationToken ct);

        // Admin/Manager "get all" with optional department scoping
        Task<(IReadOnlyList<FeedbackItemDto> Items, int Total)> GetAllAsync(
            DateTime? from, DateTime? to, int? categoryId, string? search, int? departmentScopeId,
            int? fromUserId, int? toUserId, int page, int pageSize, CancellationToken ct);

        // ✅ Count-only with same filters
        Task<int> CountAllAsync(
            DateTime? from, DateTime? to, int? categoryId, string? search, int? departmentScopeId,
            int? fromUserId, int? toUserId, CancellationToken ct);

        Task<(int Given, int Received, DateTime? LatestGivenAt, DateTime? LatestReceivedAt)> GetSummaryAsync(
            int userId, CancellationToken ct);

        // ✅ Total count across entire system
        Task<int> GetTotalCountAsync(CancellationToken ct);

        // ✅ Category statistics
        Task<IReadOnlyList<CategoryStatsDto>> GetByCategoryAsync(
            DateTime? from, DateTime? to, int? departmentScopeId, int? userId, CancellationToken ct);
    }
}
