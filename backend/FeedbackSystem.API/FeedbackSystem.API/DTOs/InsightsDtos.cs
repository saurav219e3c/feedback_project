using System.ComponentModel.DataAnnotations;

namespace FeedbackSystem.API.DTOs
{
    // Generic paged wrapper
    public record PagedResult<T>(
        int Page,
        int PageSize,
        int TotalCount,
        IReadOnlyList<T> Items
    );

    // Flat list item for Feedback
    public record FeedbackItemDto(
        int FeedbackId,
        int FromUserId,
        string FromUserName,
        int ToUserId,
        string ToUserName,
        int CategoryId,
        string CategoryName,
        string Comments,
        bool IsAnonymous,
        DateTime CreatedAt
    );

    // Flat list item for Recognition
    // Uses Category table (same as Feedback)
    public record RecognitionItemDto(
        int RecognitionId,
        int FromUserId,
        string FromUserName,
        int ToUserId,
        string ToUserName,
        int CategoryId,
        string CategoryName,
        int Points,
        string Message,
        DateTime CreatedAt
    );

    // Compact numbers for dashboards (per user)
    public record UserInsightSummaryDto(
        int UserId,
        int FeedbackGivenCount,
        int FeedbackReceivedCount,
        int RecognitionGivenCount,
        int RecognitionReceivedCount,
        DateTime? LatestFeedbackGivenAt,
        DateTime? LatestFeedbackReceivedAt,
        DateTime? LatestRecognitionGivenAt,
        DateTime? LatestRecognitionReceivedAt
    );

    // Filters for "get all" endpoints
    public record FeedbackAllFilter(
        DateTime? From,
        DateTime? To,
        int? CategoryId,
        string? Search,
        int? DepartmentId,  // Admin can use any; Manager is auto-scoped to their dept
        int? FromUserId,    // optional
        int? ToUserId,      // optional
        int Page = 1,
        int PageSize = 20
    );

    public record RecognitionAllFilter(
        DateTime? From,
        DateTime? To,
        string? Search,
        int? DepartmentId,  // Admin can use any; Manager is auto-scoped to their dept
        int? FromUserId,    // optional
        int? ToUserId,      // optional
        int Page = 1,
        int PageSize = 20
    );

    // ✅ For standalone count endpoints
    public record CountResultDto(int TotalCount);

    // ✅ Category-based statistics
    public record CategoryStatsDto(
        int CategoryId,
        string CategoryName,
        int FeedbackCount,
        DateTime? LatestFeedbackAt
    );

    public record RecognitionCategoryStatsDto(
        int CategoryId,
        string CategoryName,
        int RecognitionCount,
        DateTime? LatestRecognitionAt
    );

    // Filter for category statistics
    public record CategoryStatsFilter(
        DateTime? From,
        DateTime? To,
        int? DepartmentId,
        int? UserId  // Optional: filter by specific user (giver or receiver)
    );
}