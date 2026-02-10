using FeedbackSystem.API.Entities;

namespace FeedbackSystem.API.Repositories;

public interface IActivityRepository
{
    Task<List<ActivityLog>> GetAllAsync(CancellationToken ct);
}
