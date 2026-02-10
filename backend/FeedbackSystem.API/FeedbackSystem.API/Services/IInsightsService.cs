using FeedbackSystem.API.DTOs;

namespace FeedbackSystem.API.Services
{
    public interface IInsightsService
    {
        // Per-user
        Task<PagedResult<FeedbackItemDto>> GetFeedbackGivenAsync(
            int requesterUserId, bool isAdmin,
            int userId, DateTime? from, DateTime? to, int? categoryId, string? search, int page, int pageSize, CancellationToken ct);

        Task<PagedResult<FeedbackItemDto>> GetFeedbackReceivedAsync(
            int requesterUserId, bool isAdmin,
            int userId, DateTime? from, DateTime? to, int? categoryId, string? search, int page, int pageSize, CancellationToken ct);

        Task<PagedResult<RecognitionItemDto>> GetRecognitionsGivenAsync(
            int requesterUserId, bool isAdmin,
            int userId, DateTime? from, DateTime? to, string? search, int page, int pageSize, CancellationToken ct);

        Task<PagedResult<RecognitionItemDto>> GetRecognitionsReceivedAsync(
            int requesterUserId, bool isAdmin,
            int userId, DateTime? from, DateTime? to, string? search, int page, int pageSize, CancellationToken ct);

        Task<UserInsightSummaryDto> GetSummaryAsync(
            int requesterUserId, bool isAdmin, int userId, CancellationToken ct);

        // "Get all" across users
        Task<PagedResult<FeedbackItemDto>> GetAllFeedbackAsync(
            int requesterUserId, bool isAdmin, FeedbackAllFilter filter, CancellationToken ct);

        Task<PagedResult<RecognitionItemDto>> GetAllRecognitionsAsync(
            int requesterUserId, bool isAdmin, RecognitionAllFilter filter, CancellationToken ct);

        // ✅ Count-only across users
        Task<CountResultDto> GetAllFeedbackCountAsync(
            int requesterUserId, bool isAdmin, FeedbackAllFilter filter, CancellationToken ct);

        Task<CountResultDto> GetAllRecognitionsCountAsync(
            int requesterUserId, bool isAdmin, RecognitionAllFilter filter, CancellationToken ct);

        // ✅ Category-based statistics
        Task<IReadOnlyList<CategoryStatsDto>> GetFeedbackByCategoryAsync(
            int requesterUserId, bool isAdmin, CategoryStatsFilter filter, CancellationToken ct);

        Task<IReadOnlyList<RecognitionCategoryStatsDto>> GetRecognitionsByCategoryAsync(
            int requesterUserId, bool isAdmin, CategoryStatsFilter filter, CancellationToken ct);

        // ✅ Parameterless by-category (all data, no filters)
        Task<IReadOnlyList<CategoryStatsDto>> GetFeedbackByCategoryAsync(CancellationToken ct);
        Task<IReadOnlyList<RecognitionCategoryStatsDto>> GetRecognitionsByCategoryAsync(CancellationToken ct);
    }
}