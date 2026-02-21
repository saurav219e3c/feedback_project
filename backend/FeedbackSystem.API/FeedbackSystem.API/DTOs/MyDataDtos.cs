using System.ComponentModel.DataAnnotations;

namespace FeedbackSystem.API.DTOs;


/// Request DTO for employee submitting their own feedback
public record MyFeedbackSubmitDto(
    [Required] string ToUserId,
    [Required] string CategoryId,
    [Required] string Comments,
    bool? IsAnonymous
);


/// Request DTO for employee submitting their own recognition
//public record MyRecognitionSubmitDto(
//    [Required] string ToUserId,
//    [Required] string BadgeId,
//    [Required] [Range(1, 10)] int Points,
//    [Required] string Message
//);


/// dto for the show the all received feedback  for me
public record MyFeedbackDto
{
  //int FeedbackId,
  //string Direction,  
  //string OtherUserId,
  //string OtherUserName,
  //string CategoryId,
  //string CategoryName,
  //string Comments,
  //bool IsAnonymous,
  //DateTime CreatedAt



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
/// Result of feedback submission
public record MyFeedbackSubmitResultDto(
    int FeedbackId,
    bool Success,
    string Message
);


//recognition

/// Response DTO for "My Recognition" items

///// REQUEST: What Angular sends to .NET to award a badge and points.
public record MyRecognitionsubmitDto(
    //int RecognitionId,
    //string Direction,  
    //string OtherUserId,
    //string OtherUserName,
    //string BadgeId,
    //string BadgeName,
    //int Points,
    //string Message,
    //DateTime CreatedAt

    [Required] string ToUserId,
    [Required] string BadgeId,
    [Required][Range(1, 10)] int Points,
    [Required] string Message
);

// fro the submit recognition response dto
/// Request DTO for employee submitting their own recognition
/// /// RESPONSE: What .NET returns immediately after saving the recognition.
public record MyRecognitionrResponseDto(
    int RecognitionId,
    bool Success,
    string Message,
    int Points
);

//get all reco dto

//RESPONSE: What .NET returns when fetching a list of recognitions.
public record MyAllRecognitionItemDto
{
  //int RecognitionId,
  //string FromUserId,
  //string FromUserName,
  //string ToUserId,
  //string ToUserName,
  //string BadgeId,
  //string BadgeName,
  //int Points,
  //string Message,
  //DateTime CreatedAt
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




/// Summary of user's feedback and recognition stats
public record MySummaryDto(
    int FeedbackGivenCount,
    int FeedbackReceivedCount,
    int RecognitionGivenCount,
    int RecognitionReceivedCount,
    int TotalPointsGiven,
    int TotalPointsReceived,
    DateTime? LastActivityAt
);






