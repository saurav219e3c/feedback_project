using FeedbackSystem.API.DTOs.admin;
using FeedbackSystem.API.Repositories.Interfaces;
using FeedbackSystem.API.Services.interfaces;

namespace FeedbackSystem.API.Services;

public class ActivityService : IActivityService
{
    private readonly IActivityRepository _repo;

    public ActivityService(IActivityRepository repo) => _repo = repo;

    public async Task<List<ActivityItemDto>> GetAllAsync(CancellationToken ct)
    {
        var logs = await _repo.GetAllAsync(ct);

        return logs.Select(a => new ActivityItemDto(
            a.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            a.User.FullName,
            a.ActionType,
            a.EntityType != null
                ? $"{a.EntityType} #{a.EntityId}"
                : string.Empty
        )).ToList();
    }
}
