using FeedbackSystem.API.DTOs.Employee;

namespace FeedbackSystem.API.Services.interfaces;

//emp service 
public interface IEmployeeService
{
    //SUBMIT FB
    Task<MyFeedbackSubmitResultDto> SubmitMyFeedbackAsync(string userId, MyFeedbackSubmitDto dto, CancellationToken ct);

    //GET ALL FB SERVICE
    Task<List<MyFeedbackDto>> GetMyFeedbackAsync(string userId, string? direction, CancellationToken ct);

  // Recognition

  //submit recognition
  Task<MyRecognitionrResponseDto> SubmitMyRecognitionAsync(string userId, MyRecognitionsubmitDto dto, CancellationToken ct);

  //get all my recognition
  Task<List<MyAllRecognitionItemDto>> GetMyRecognitionAsync(string userId, string? direction, CancellationToken ct);
    
  //dashboard summary
  Task<MySummaryDto> GetMySummaryAsync(string userId, CancellationToken ct);
}
