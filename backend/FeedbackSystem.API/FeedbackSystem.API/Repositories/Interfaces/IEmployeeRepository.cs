using FeedbackSystem.API.Entities;

namespace FeedbackSystem.API.Repositories.Interfaces
{
  public interface IEmployeeRepository
  {
    //add fb to db
    public  Task AddAsync(Feedback feedback,CancellationToken ct);

    //get fb from db 
    Task<List<Feedback>> GetAllFeedbacksAsync(string userId, string? direction, CancellationToken ct);


    //dashboard stats
    Task<(int Given, int Received, DateTime? LastActivity)> GetFeedbackSummaryStatsAsync(string userId, CancellationToken ct);


  }
}
