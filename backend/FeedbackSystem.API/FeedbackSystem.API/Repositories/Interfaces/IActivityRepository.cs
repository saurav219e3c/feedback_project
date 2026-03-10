using FeedbackSystem.API.Entities;

namespace FeedbackSystem.API.Repositories.Interfaces;

public interface IActivityRepository
{
    Task<List<ActivityLog>> GetAllAsync(CancellationToken ct);
}
