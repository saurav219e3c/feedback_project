using FeedbackSystem.API.DTOs;
using FeedbackSystem.API.Entities;

namespace FeedbackSystem.API.Repositories
{
    public interface IRecognitionRepository
    {

    //employee module service calls
    Task<bool> UserExistsAsync(string userId, CancellationToken ct);
    Task<string> GetBadgeNameAsync(string badgeId, CancellationToken ct);
    Task AddRecognitionAsync(Recognition recognition, CancellationToken ct);
    Task<List<Recognition>> GetUserRecognitionsAsync(string userId, string? direction, CancellationToken ct);
    Task<(IReadOnlyList<RecognitionItemDto> Items, int Total)> GetGivenAsync(
            string userId, DateTime? from, DateTime? to, string? search, int page, int pageSize, CancellationToken ct);

        Task<(IReadOnlyList<RecognitionItemDto> Items, int Total)> GetReceivedAsync(
            string userId, DateTime? from, DateTime? to, string? search, int page, int pageSize, CancellationToken ct);

        // Admin/Manager "get all" with optional department scoping
        Task<(IReadOnlyList<RecognitionItemDto> Items, int Total)> GetAllAsync(
            DateTime? from, DateTime? to, string? search, string? departmentScopeId,
            string? fromUserId, string? toUserId, int page, int pageSize, CancellationToken ct);

        // ✅ Count-only with same filters
        Task<int> CountAllAsync(
            DateTime? from, DateTime? to, string? search, string? departmentScopeId,
            string? fromUserId, string? toUserId, CancellationToken ct);

        Task<(int Given, int Received, DateTime? LatestGivenAt, DateTime? LatestReceivedAt)> GetSummaryAsync(
            string userId, CancellationToken ct);

        // ✅ Total count across entire system
        Task<int> GetTotalCountAsync(CancellationToken ct);

        // ✅ Badge statistics
        Task<IReadOnlyList<RecognitionBadgeStatsDto>> GetByBadgeAsync(
            DateTime? from, DateTime? to, string? departmentScopeId, string? userId, CancellationToken ct);
    }
}
