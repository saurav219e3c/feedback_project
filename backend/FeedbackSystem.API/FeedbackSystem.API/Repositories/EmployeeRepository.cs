using FeedbackSystem.API.Data;
using FeedbackSystem.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace FeedbackSystem.API.Repositories
{
  public class EmployeeRepository : IEmployeeRepository
  {
    private readonly AppDbContext dbContext;

    public EmployeeRepository(AppDbContext dbContext)
    {
      this.dbContext = dbContext;
    }
    public async Task AddAsync(Feedback feedback, CancellationToken ct)
    {
      await dbContext.Feedbacks.AddAsync(feedback, ct);
      await dbContext.SaveChangesAsync(ct);

    }

    public async Task<List<Feedback>> GetAllFeedbacksAsync(string userId, string? direction, CancellationToken ct)
    {
      var query = dbContext.Feedbacks
        .Include(f => f.Category)
        .Include(f => f.FromUser)
        .AsNoTracking();

      // Simpler way to apply filters based on direction
      query = direction?.ToLower() switch
      {
        "given" => query.Where(f => f.FromUserId == userId),
        "received" => query.Where(f => f.ToUserId == userId),
        _ => query.Where(f => f.FromUserId == userId || f.ToUserId == userId)
      };

      return await query.OrderByDescending(f => f.CreatedAt).ToListAsync(ct);


    }

    public async Task<(int Given, int Received, DateTime? LastActivity)> GetFeedbackSummaryStatsAsync(string userId, CancellationToken ct)
    {
      var given = await dbContext.Feedbacks.CountAsync(f => f.FromUserId == userId, ct);
      var received = await dbContext.Feedbacks.CountAsync(f => f.ToUserId == userId, ct);

      // Optimized: MaxAsync is much faster than OrderBy.FirstOrDefault for getting the latest date!
      var lastActivity = await dbContext.Feedbacks
          .Where(f => f.FromUserId == userId || f.ToUserId == userId)
          .MaxAsync(f => (DateTime?)f.CreatedAt, ct);

      return (given, received, lastActivity);
    }
  }
}
