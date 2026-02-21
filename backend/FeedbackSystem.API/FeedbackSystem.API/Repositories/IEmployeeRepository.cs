using FeedbackSystem.API.Entities;

namespace FeedbackSystem.API.Repositories
{
  public interface IEmployeeRepository
  {

    public  Task AddAsync(Feedback feedback,CancellationToken ct);
    Task<List<Feedback>> GetAllFeedbacksAsync(string userId, string? direction, CancellationToken ct);

    Task<(int Given, int Received, DateTime? LastActivity)> GetFeedbackSummaryStatsAsync(string userId, CancellationToken ct);


  }
}
