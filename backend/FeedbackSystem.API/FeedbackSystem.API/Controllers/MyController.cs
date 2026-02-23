using FeedbackSystem.API.DTOs.Employee;
using FeedbackSystem.API.Services;
using FeedbackSystem.API.Services.interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FeedbackSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]  
public class MyController : ControllerBase
{
  private readonly IEmployeeService employeeService;
  private readonly ILogger<MyController> _logger;

  public MyController(
      
      IEmployeeService employeeService,
      ILogger<MyController> logger)
  {
    this.employeeService = employeeService;
    _logger = logger;
  }

  // ==================== FEEDBACK ====================

  //send feedback to someone
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
    var result = await employeeService.SubmitMyFeedbackAsync(userId, dto, ct);

    return Ok(result);

  }



  //get feedback I received 
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
    var result = await employeeService.GetMyFeedbackAsync(userId, direction, ct);

    return Ok(result);
  }

  // ==================== RECOGNITION ====================

  //submit recognition to someone
  //api/my/recognition
  [HttpPost("recognition")]
  public async Task<ActionResult<MyRecognitionrResponseDto>> SubmitRecognition(
      [FromBody] MyRecognitionsubmitDto dto,
      CancellationToken ct)
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId))
      throw new UnauthorizedAccessException("User ID not found in token."); 
      
    var result = await employeeService.SubmitMyRecognitionAsync(userId, dto, ct);

    return Ok(result);
  }

  //get recognition I received
  [HttpGet("recognition")]
  public async Task<ActionResult<List<MyAllRecognitionItemDto>>> GetMyRecognition(
      [FromQuery] string? direction,
      CancellationToken ct)
  {
    

    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrEmpty(userId))
      throw new UnauthorizedAccessException("User ID not found in token."); // Handled globally

    var result = await employeeService.GetMyRecognitionAsync(userId, direction, ct);

    return Ok(result);
  }

    //dashboard stats
  [HttpGet("summary")]
  public async Task<ActionResult<MySummaryDto>> GetMySummary(CancellationToken ct)
  {
    
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId))
      throw new UnauthorizedAccessException("User ID not found in token.");

    var result = await employeeService.GetMySummaryAsync(userId, ct);

    return Ok(result);
  }

}
