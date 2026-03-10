using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace FeedbackSystem.API.Middleware
{
  public class GlobalExceptionHandler : IExceptionHandler
  {
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
      _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
      // 1. Log every error automatically
      _logger.LogError(exception, "An unhandled exception occurred.");

      // 2. Set up a standard ProblemDetails response
      var problemDetails = new ProblemDetails
      {
        Instance = httpContext.Request.Path
      };

      // 3. Cleanly map specific exceptions using a switch statement
      switch (exception)
      {
        case InvalidOperationException invalidOpEx:
          problemDetails.Title = "Bad Request";
          problemDetails.Status = StatusCodes.Status400BadRequest;
          problemDetails.Detail = invalidOpEx.Message;
          break;

        case KeyNotFoundException keyNotFoundEx:
          // Perfect for "User not found" or "Feedback ID not found"
          problemDetails.Title = "Not Found";
          problemDetails.Status = StatusCodes.Status404NotFound;
          problemDetails.Detail = keyNotFoundEx.Message;
          break;

        case ArgumentException argEx:
          // Perfect for validation errors
          problemDetails.Title = "Invalid Argument";
          problemDetails.Status = StatusCodes.Status400BadRequest;
          problemDetails.Detail = argEx.Message;
          break;

        case UnauthorizedAccessException unauthEx:
          // Perfect for security/permission rejections
          problemDetails.Title = "Unauthorized";
          problemDetails.Status = StatusCodes.Status403Forbidden;
          problemDetails.Detail = "You do not have permission to perform this action.";
          break;

        default:
          // The ultimate safety net for true crashes
          problemDetails.Title = "Internal Server Error";
          problemDetails.Status = StatusCodes.Status500InternalServerError;
          problemDetails.Detail = "An unexpected error occurred while processing your request.";
          break;
      }

      // 4. Write the response back to the client
      httpContext.Response.StatusCode = problemDetails.Status.Value;
      await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

      return true;
    }
  }
}

