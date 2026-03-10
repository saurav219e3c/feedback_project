using FeedbackSystem.API.DTOs;
using FeedbackSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FeedbackSystem.API.Controllers;


/// Employee's personal feedback and recognition endpoints

[ApiController]
[Route("api/[controller]")]
[Authorize]  
public class MyController : ControllerBase
{
  private readonly IMyDataService _myDataService;
  private readonly ILogger<MyController> _logger;

  public MyController(
      IMyDataService myDataService,
      ILogger<MyController> logger)
  {
    _myDataService = myDataService;
    _logger = logger;
  }

  // ==================== FEEDBACK ====================

 
  /// POST /api/my/feedback - Submit feedback
  
  [HttpPost("feedback")]
  public async Task<ActionResult<MyFeedbackSubmitResultDto>> SubmitFeedback(
      [FromBody] MyFeedbackSubmitDto dto,
      CancellationToken ct)
  {
    
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    _logger.LogInformation("Extracted userId from token: {UserId}", userId);

    if (string.IsNullOrEmpty(userId))
      return Unauthorized();

    // GlobalExceptionHandler will catch InvalidOperationException or generic Exceptions
    var result = await _myDataService.SubmitMyFeedbackAsync(userId, dto, ct);

    return Ok(result);


  }


  /// GET /api/my/feedback?direction=given|received - Get my feedback
  
  [HttpGet("feedback")]
  public async Task<ActionResult<List<MyFeedbackDto>>> GetMyFeedback(
      [FromQuery] string? direction,
      CancellationToken ct)
  {
    

    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrEmpty(userId))
      return Unauthorized(new { message = "User ID not found in token." });

    // If this throws an exception, the GlobalExceptionHandler will automatically
    // catch it, log it, and return a standardized 500 response!
    var result = await _myDataService.GetMyFeedbackAsync(userId, direction, ct);

    return Ok(result);
  }


  // ==================== RECOGNITION ====================

  /// POST /api/my/recognition - Submit recognition
 
  [HttpPost("recognition")]
  public async Task<ActionResult<MyRecognitionResponseDto>> SubmitRecognition(
      [FromBody] MyRecognitionSubmitDto dto,
      CancellationToken ct)
  {
    
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId))
      throw new UnauthorizedAccessException("User ID not found in token.");

    var result = await _myDataService.SubmitMyRecognitionAsync(userId, dto, ct);

    return Ok(result);
  }

  
  /// GET /api/my/recognition?direction=given|received - Get my recognition
  
  [HttpGet("recognition")]
  public async Task<ActionResult<List<MyAllRecognitionItemDto>>> GetMyRecognition(
      [FromQuery] string? direction,
      CancellationToken ct)
  {
    
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrEmpty(userId))
      throw new UnauthorizedAccessException("User ID not found in token."); // Handled globally

    var result = await _myDataService.GetMyRecognitionAsync(userId, direction, ct);

    return Ok(result);
  }



  // ==================== SUMMARY ====================

  
  /// GET /api/my/summary - Get my overall statistics
  
  [HttpGet("summary")]
  public async Task<ActionResult<MySummaryDto>> GetMySummary(CancellationToken ct)
  {
    
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId))
      throw new UnauthorizedAccessException("User ID not found in token.");

    var result = await _myDataService.GetMySummaryAsync(userId, ct);

    return Ok(result);
  }

}
