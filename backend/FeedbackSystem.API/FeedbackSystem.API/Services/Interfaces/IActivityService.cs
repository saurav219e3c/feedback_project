using FeedbackSystem.API.DTOs.Admin;

namespace FeedbackSystem.API.Services.Interfaces;

public interface IActivityService
{
    Task<List<ActivityItemDto>> GetAllAsync(CancellationToken ct);
}
