using FeedbackSystem.API.DTOs;

namespace FeedbackSystem.API.Services;

public interface IActivityService
{
    Task<List<ActivityItemDto>> GetAllAsync(CancellationToken ct);
}
