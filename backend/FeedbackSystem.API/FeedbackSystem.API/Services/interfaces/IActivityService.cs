using FeedbackSystem.API.DTOs.admin;

namespace FeedbackSystem.API.Services.interfaces;

public interface IActivityService
{
    Task<List<ActivityItemDto>> GetAllAsync(CancellationToken ct);
}
