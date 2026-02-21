using FeedbackSystem.API.DTOs;

namespace FeedbackSystem.API.Services.interfaces;

/// <summary>
/// Service for employee's personal feedback and recognition data
/// </summary>
public interface IEmployeeService
{
    //SUBMIT FB
    Task<MyFeedbackSubmitResultDto> SubmitMyFeedbackAsync(string userId, MyFeedbackSubmitDto dto, CancellationToken ct);

    //GET ALL FB SERVICE
    Task<List<MyFeedbackDto>> GetMyFeedbackAsync(string userId, string? direction, CancellationToken ct);

  // Recognition
  Task<MyRecognitionrResponseDto> SubmitMyRecognitionAsync(string userId, MyRecognitionsubmitDto dto, CancellationToken ct);
  Task<List<MyAllRecognitionItemDto>> GetMyRecognitionAsync(string userId, string? direction, CancellationToken ct);
    
    // Summary
    Task<MySummaryDto> GetMySummaryAsync(string userId, CancellationToken ct);
}
