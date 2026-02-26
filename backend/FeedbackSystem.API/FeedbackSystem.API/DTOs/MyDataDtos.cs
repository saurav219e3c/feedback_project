using System.ComponentModel.DataAnnotations;

namespace FeedbackSystem.API.DTOs;

/// <summary>
/// Request DTO for employee submitting their own feedback
/// </summary>
/// /// Request DTO for employee submitting their own feedback
public record MyFeedbackSubmitDto(
    [Required] string ToUserId,
    [Required] string CategoryId,
    [Required] string Comments,
    bool? IsAnonymous
);

// <summary>
/// Result of feedback submission
/// </summary>
/// Result of feedback submission
public record MyFeedbackSubmitResultDto(
    int FeedbackId,
    bool Success,
    string Message
);



/// <summary>
/// Request DTO for employee submitting their own recognition
/// </summary>
public record MyRecognitionSubmitDto(
    [Required] string ToUserId,
    [Required] string BadgeId,
    [Required] [Range(1, 10)] int Points,
    [Required] string Message
);

public record MyRecognitionResponseDto(
    int RecognitionId,
    bool Success,
    string Message,
    int Points
);


public record MyFeedbackDto
{
  public int FeedbackId { get; init; }
  public string? FromUserId { get; init; } // Nullable for anonymity
  public string ToUserId { get; init; } = string.Empty;
  public string FromUserName { get; init; } = string.Empty;
  public string CategoryId { get; init; }
  public string CategoryName { get; init; } = string.Empty;
  public string Comments { get; init; } = string.Empty;
  public bool IsAnonymous { get; init; }
  public DateTime CreatedAt { get; init; }



}


/// <summary>
/// Summary of user's feedback and recognition stats
/// </summary>
public record MySummaryDto(
    int FeedbackGivenCount,
    int FeedbackReceivedCount,
    int RecognitionGivenCount,
    int RecognitionReceivedCount,
    int TotalPointsGiven,
    int TotalPointsReceived,
    DateTime? LastActivityAt

    
);

public record MyAllRecognitionItemDto
{
  public int RecognitionId { get; init; }
  public string FromUserId { get; init; } = string.Empty;
  public string FromUserName { get; init; } = string.Empty;
  public string ToUserId { get; init; } = string.Empty;
  public string ToUserName { get; init; } = string.Empty;
  public string BadgeId { get; init; } = string.Empty;
  public string BadgeName { get; init; } = string.Empty;
  public int Points { get; init; }
  public string Message { get; init; } = string.Empty;
  public DateTime CreatedAt { get; init; }
}





