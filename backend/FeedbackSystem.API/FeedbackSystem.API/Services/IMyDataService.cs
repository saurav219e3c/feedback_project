using FeedbackSystem.API.DTOs;

namespace FeedbackSystem.API.Services;

/// <summary>
/// Service for employee's personal feedback and recognition data
/// </summary>
public interface IMyDataService
{
   
  //SUBMIT FB
  Task<MyFeedbackSubmitResultDto> SubmitMyFeedbackAsync(string userId, MyFeedbackSubmitDto dto, CancellationToken ct);


  Task<List<MyFeedbackDto>> GetMyFeedbackAsync(string userId, string? direction, CancellationToken ct);
    
    // Recognition
    Task<MyRecognitionResponseDto> SubmitMyRecognitionAsync(string userId, MyRecognitionSubmitDto dto, CancellationToken ct);
    Task<List<MyAllRecognitionItemDto>> GetMyRecognitionAsync(string userId, string? direction, CancellationToken ct);
    
    // Summary
    Task<MySummaryDto> GetMySummaryAsync(string userId, CancellationToken ct);
}
