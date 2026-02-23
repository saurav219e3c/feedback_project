using FeedbackSystem.API.DTOs;
using FeedbackSystem.API.Repositories;

namespace FeedbackSystem.API.Services;

public class ActivityService : IActivityService
{
    private readonly IActivityRepository _repo;

    public ActivityService(IActivityRepository repo) => _repo = repo;

    public async Task<List<ActivityItemDto>> GetAllAsync(CancellationToken ct)
    {
        var logs = await _repo.GetAllAsync(ct);

        return logs.Select(a => new ActivityItemDto(
            FormatTimeAgo(a.CreatedAt),
            a.User.FullName,
            a.ActionType,
            a.EntityType != null
                ? $"{a.EntityType} #{a.EntityId}"
                : string.Empty
        )).ToList();
    }

    private static string FormatTimeAgo(DateTime createdAt)
    {
        var now = DateTime.UtcNow;
        var timeSpan = now - createdAt;

        if (timeSpan.TotalMinutes < 1)
            return "Just now";
        if (timeSpan.TotalMinutes < 2)
            return "1 min ago";
        if (timeSpan.TotalMinutes < 60)
            return $"{(int)timeSpan.TotalMinutes} min ago";
        if (timeSpan.TotalHours < 2)
            return "1 hour ago";
        if (timeSpan.TotalHours < 24)
            return $"{(int)timeSpan.TotalHours} hours ago";
        if (timeSpan.TotalDays < 2)
            return "Yesterday";
        if (timeSpan.TotalDays < 7)
            return $"{(int)timeSpan.TotalDays} days ago";
        if (timeSpan.TotalDays < 30)
            return $"{(int)(timeSpan.TotalDays / 7)} weeks ago";
        
        return createdAt.ToString("MMM dd, yyyy");
    }
}
