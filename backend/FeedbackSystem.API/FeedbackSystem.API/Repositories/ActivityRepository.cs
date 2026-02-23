using FeedbackSystem.API.Data;
using FeedbackSystem.API.Entities;
using FeedbackSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FeedbackSystem.API.Repositories;

public class ActivityRepository : IActivityRepository
{
    private readonly AppDbContext _db;

    public ActivityRepository(AppDbContext db) => _db = db;

    public async Task<List<ActivityLog>> GetAllAsync(CancellationToken ct)
    {
        return await _db.ActivityLogs
            .AsNoTracking()
            .Include(a => a.User)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);
    }
}
