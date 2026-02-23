using AutoMapper;
using FeedbackSystem.API.Data;
using FeedbackSystem.API.DTOs.Employee;
using FeedbackSystem.API.Entities;
using FeedbackSystem.API.Repositories.Interfaces;
using FeedbackSystem.API.Services.interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace FeedbackSystem.API.Services;

public class EmployeeService : IEmployeeService
{
  private readonly AppDbContext _db;
  private readonly IEmployeeRepository employeeRepository;
  private readonly IRecognitionRepository recognitionRepository;
  private readonly IMapper mapper;
  private readonly ILogger<EmployeeService> _logger;

  public EmployeeService(
      AppDbContext db,
      IEmployeeRepository employeeRepository,
      IRecognitionRepository recognitionRepository,
      IMapper mapper,
      ILogger<EmployeeService> logger)
  {
    _db = db;
    this.employeeRepository = employeeRepository;
    this.recognitionRepository = recognitionRepository;
    this.mapper = mapper;
    _logger = logger;
  }

  /// <summary>
  /// Creates notifications for all managers in the same department as the sender or target user
  /// </summary>
  private async Task NotifyManagersAsync(
      string fromUserId,
      string toUserId,
      string notificationType,
      string categoryOrBadgeName,
      CancellationToken ct)
  {
    try
    {
      // Get both users to find their departments
      var fromUser = await _db.Users
          .AsNoTracking()
          .FirstOrDefaultAsync(u => u.UserId == fromUserId, ct);

      var targetUser = await _db.Users
          .AsNoTracking()
          .FirstOrDefaultAsync(u => u.UserId == toUserId, ct);

      if (fromUser == null || targetUser == null) return;

      var fromUserName = fromUser.FullName ?? "An employee";

      // Get the manager role ID
      var managerRoleId = await _db.Roles
          .Where(r => r.RoleName == "Manager")
          .Select(r => r.RoleId)
          .FirstOrDefaultAsync(ct);

      if (managerRoleId == 0) return;

      // Collect department IDs (both sender's and target's departments)
      var departmentIds = new HashSet<string> { fromUser.DepartmentId, targetUser.DepartmentId };

      // Find all managers in either department (sender's or target's)
      var managersInDepartments = await _db.Users
          .Where(u => u.RoleId == managerRoleId
                   && departmentIds.Contains(u.DepartmentId)
                   && u.IsActive
                   && u.UserId != fromUserId) // Don't notify the sender if they are a manager
          .ToListAsync(ct);

      if (!managersInDepartments.Any()) return;

      // Create notification for each manager
      var title = notificationType == "Feedback"
          ? "New Feedback Submitted"
          : "New Recognition Given";

      var message = notificationType == "Feedback"
          ? $"{fromUserName} submitted feedback for {targetUser.FullName} in category '{categoryOrBadgeName}'"
          : $"{fromUserName} gave recognition to {targetUser.FullName} with badge '{categoryOrBadgeName}'";

      var notifications = managersInDepartments.Select(manager => new Notification
      {
        UserId = manager.UserId,
        Title = title,
        Message = message,
        IsRead = false,
        CreatedAt = DateTime.UtcNow
      }).ToList();

      _db.Notifications.AddRange(notifications);
      await _db.SaveChangesAsync(ct);

      _logger.LogInformation(
          "Created {Count} notifications for {Type} from {From} to {To}",
          notifications.Count, notificationType, fromUserId, toUserId);
    }
    catch (Exception ex)
    {
      // Log but don't fail the main operation
      _logger.LogError(ex, "Failed to create manager notifications for {Type}", notificationType);
    }
  }

  public async Task<MyFeedbackSubmitResultDto> SubmitMyFeedbackAsync(
      string userId,
      MyFeedbackSubmitDto dto,
      CancellationToken ct)
  {
    // 1. Validate target user exists 
    bool userExists = await _db.Users.AnyAsync(u => u.UserId == dto.ToUserId, ct);
    if (!userExists)
      throw new InvalidOperationException($"Target user '{dto.ToUserId}' not found.");

    // 2. Validate category exists
    var category = await _db.Categories.FindAsync(new object[] { dto.CategoryId }, ct);
    if (category == null)
      throw new InvalidOperationException($"Category '{dto.CategoryId}' not found.");

    // 3. Create feedback entity
    var feedback = mapper.Map<Feedback>(dto);
    feedback.FromUserId = userId;
    feedback.CreatedAt = DateTime.UtcNow;

    // Delegate saving to the Repository
    await employeeRepository.AddAsync(feedback, ct);

    // 4. Fire and log notifications safely 
    try
    {
      await NotifyManagersAsync(userId, dto.ToUserId, "Feedback", category.CategoryName, ct);
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "Failed to notify managers. FeedbackId: {FeedbackId}", feedback.FeedbackId);
    }

    // 5. Return success
    return new MyFeedbackSubmitResultDto(
        feedback.FeedbackId,
        true,
        "Feedback submitted successfully"
    );
  }

  public async Task<List<MyFeedbackDto>> GetMyFeedbackAsync(
      string userId,
      string? direction,
      CancellationToken ct)
  {
    
    var feedbacks = await employeeRepository.GetAllFeedbacksAsync(userId, direction, ct);
    var dtos = mapper.Map<List<MyFeedbackDto>>(feedbacks);

    for (int i = 0; i < dtos.Count; i++)
    {
      // Business Rule: Hide sender ID if the user received it and it is anonomous
      if (dtos[i].ToUserId == userId && dtos[i].IsAnonymous)
      {
        dtos[i] = dtos[i] with { FromUserName = "Anonymous Colleague", FromUserId = "Anonymous" };
      }
    }

    return dtos;
  }

  public async Task<MyRecognitionrResponseDto> SubmitMyRecognitionAsync(
      string userId,
      MyRecognitionsubmitDto dto,
      CancellationToken ct)
  {
    // 1. Validate target user exists
    var targetUserExists = await recognitionRepository.UserExistsAsync(dto.ToUserId, ct);
    if (!targetUserExists)
      throw new KeyNotFoundException($"Target user '{dto.ToUserId}' not found.");

    // 2. Validate badge exists & get name for notification
    var badgeName = await recognitionRepository.GetBadgeNameAsync(dto.BadgeId, ct);
    if (badgeName == null)
      throw new KeyNotFoundException($"Badge '{dto.BadgeId}' not found.");

    // 3. Map DTO to Entity via AutoMapper
    var recognition = mapper.Map<Recognition>(dto);
    recognition.FromUserId = userId;
    recognition.CreatedAt = DateTime.UtcNow;

    // 4. Save via Repository
    await recognitionRepository.AddRecognitionAsync(recognition, ct);

    // 5. Fire off notifications
    await NotifyManagersAsync(userId, dto.ToUserId, "Recognition", badgeName, ct);

    // 6. Return Result
    return new MyRecognitionrResponseDto(
        recognition.RecognitionId,
        true,
        "Recognition submitted successfully",
        dto.Points
);
  }

  public async Task<List<MyAllRecognitionItemDto>> GetMyRecognitionAsync(
      string userId,
      string? direction,
      CancellationToken ct)
  {
    
    // 1.Get raw entities from the database
        var recognitions = await recognitionRepository.GetUserRecognitionsAsync(userId, direction, ct);

    // 2. Map the List<Recognition> to List<MyRecognitionItemDto> using AutoMapper
    return mapper.Map<List<MyAllRecognitionItemDto>>(recognitions);

  }

  public async Task<MySummaryDto> GetMySummaryAsync(string userId, CancellationToken ct)
  {

    // 1. Get stats from Repositories (Sequentially to avoid EF Core concurrency issues)
    var feedbackStats = await employeeRepository.GetFeedbackSummaryStatsAsync(userId, ct);
    var recognitionStats = await recognitionRepository.GetRecognitionSummaryStatsAsync(userId, ct);

    // 2. Calculate the absolute latest activity date
    DateTime? finalLastActivity = null;
    if (feedbackStats.LastActivity.HasValue && recognitionStats.LastActivity.HasValue)
    {
      finalLastActivity = feedbackStats.LastActivity > recognitionStats.LastActivity
          ? feedbackStats.LastActivity
          : recognitionStats.LastActivity;
    }
    else
    {
      finalLastActivity = feedbackStats.LastActivity ?? recognitionStats.LastActivity;
    }
    // 3. Return the populated DTO (No AutoMapper needed for raw numbers!)
    return new MySummaryDto
    (
      feedbackStats.Given,
      feedbackStats.Received,
      recognitionStats.Given,
      recognitionStats.Received,
      recognitionStats.PointsGiven,
      recognitionStats.PointsReceived,
      finalLastActivity
    );
  }
}
