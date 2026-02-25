using AutoMapper;
using FeedbackSystem.API.Data;
using FeedbackSystem.API.DTOs;
using FeedbackSystem.API.Entities;
using FeedbackSystem.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FeedbackSystem.API.Services;

public class MyDataService : IMyDataService
{
  private readonly AppDbContext _db;
  private readonly ILogger<MyDataService> _logger;
  private readonly IMapper mapper;
  private readonly IFeedbackRepository feedbackRepository;
  private readonly IRecognitionRepository recognitionRepository;

  public MyDataService(
        AppDbContext db,
        ILogger<MyDataService> logger,
        IMapper mapper,
        IFeedbackRepository feedbackRepository,
        IRecognitionRepository recognitionRepository)
  {
    _db = db;
    _logger = logger;
    this.mapper = mapper;
    this.feedbackRepository = feedbackRepository;
    this.recognitionRepository = recognitionRepository;
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
    //// Validate target user exists
    //var targetUser = await _db.Users.FindAsync(new object[] { dto.ToUserId }, ct);
    //if (targetUser == null)
    //    throw new InvalidOperationException($"Target user '{dto.ToUserId}' not found.");

    //// Validate category exists
    //var category = await _db.Categories.FindAsync(new object[] { dto.CategoryId }, ct);
    //if (category == null)
    //    throw new InvalidOperationException($"Category '{dto.CategoryId}' not found.");

    //// Create feedback entity
    //var feedback = new Feedback
    //{
    //    FromUserId = userId,
    //    ToUserId = dto.ToUserId,
    //    CategoryId = dto.CategoryId,
    //    Comments = dto.Comments,
    //    IsAnonymous = dto.IsAnonymous ?? false,
    //    CreatedAt = DateTime.UtcNow
    //};

    //_db.Feedbacks.Add(feedback);

    //// Create activity log
    //var activityLog = new ActivityLog
    //{
    //    UserId = userId,
    //    ActionType = "Gave Feedback",
    //    EntityType = "Feedback",
    //    EntityId = null, // Will be set after SaveChanges
    //    CreatedAt = DateTime.UtcNow
    //};
    //_db.ActivityLogs.Add(activityLog);

    //await _db.SaveChangesAsync(ct);

    //// Update activity log with feedback ID
    //activityLog.EntityId = feedback.FeedbackId;
    //await _db.SaveChangesAsync(ct);

    //// Notify managers in the target user's department
    //await NotifyManagersAsync(userId, dto.ToUserId, "Feedback", category.CategoryName, ct);

    //return new MyFeedbackSubmitResultDto(
    //    feedback.FeedbackId,
    //    true,
    //    "Feedback submitted successfully"
    //);

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
    await feedbackRepository.AddAsync(feedback, ct);
    //add activity logs
    //// Create activity log
    var activityLog = new ActivityLog
    {
      UserId = userId,
      ActionType = "Gave Feedback",
      EntityType = "Feedback",
      EntityId = null, // Will be set after SaveChanges
      CreatedAt = DateTime.UtcNow
    };

    _db.ActivityLogs.Add(activityLog);

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
    //    var query = _db.Feedbacks
    //        .AsNoTracking()
    //        .Include(f => f.FromUser)
    //        .Include(f => f.ToUser)
    //        .Include(f => f.Category)
    //        .Where(f => f.FromUserId == userId || f.ToUserId == userId);

    //    // Filter by direction if specified
    //    if (!string.IsNullOrWhiteSpace(direction))
    //    {
    //        if (direction.Equals("given", StringComparison.OrdinalIgnoreCase))
    //            query = query.Where(f => f.FromUserId == userId);
    //        else if (direction.Equals("received", StringComparison.OrdinalIgnoreCase))
    //            query = query.Where(f => f.ToUserId == userId);
    //    }

    //    var feedbacks = await query
    //        .OrderByDescending(f => f.CreatedAt)
    //        .ToListAsync(ct);

    //    return feedbacks.Select(f => new MyFeedbackDto(
    //        f.FeedbackId,
    //        f.FromUserId == userId ? "Given" : "Received",
    //        f.FromUserId == userId ? f.ToUserId : f.FromUserId,
    //        f.FromUserId == userId ? f.ToUser.FullName : f.FromUser.FullName,
    //        f.CategoryId,
    //        f.Category.CategoryName,
    //        f.Comments,
    //        f.IsAnonymous,
    //        f.CreatedAt
    //    )).ToList();
    var feedbacks = await feedbackRepository.GetAllFeedbacksAsync(userId, direction, ct);
    var dtos = mapper.Map<List<MyFeedbackDto>>(feedbacks);

    for (int i = 0; i < dtos.Count; i++)
    {
      // Business Rule: Hide sender ID if the user received it and it is anonomous
      if (dtos[i].ToUserId == userId && dtos[i].IsAnonymous)
      {
        dtos[i] = dtos[i] with
        {
          FromUserName = "Anonymous Colleague",
          FromUserId = "Anonymous"
        };
      }
    }

    return dtos;


  }

  public async Task<MyRecognitionResponseDto> SubmitMyRecognitionAsync(
      string userId,
      MyRecognitionSubmitDto dto,
      CancellationToken ct)
  {
    //// Validate target user exists
    //var targetUser = await _db.Users.FindAsync(new object[] { dto.ToUserId }, ct);
    //if (targetUser == null)
    //    throw new InvalidOperationException($"Target user '{dto.ToUserId}' not found.");

    //// Validate badge exists
    //var badge = await _db.Badges.FindAsync(new object[] { dto.BadgeId }, ct);
    //if (badge == null)
    //    throw new InvalidOperationException($"Badge '{dto.BadgeId}' not found.");

    //// Create recognition entity
    //var recognition = new Recognition
    //{
    //    FromUserId = userId,
    //    ToUserId = dto.ToUserId,
    //    BadgeId = dto.BadgeId,
    //    Points = dto.Points,
    //    Message = dto.Message,
    //    CreatedAt = DateTime.UtcNow
    //};

    //_db.Recognitions.Add(recognition);

    //// Create activity log
    //var activityLog = new ActivityLog
    //{
    //    UserId = userId,
    //    ActionType = "Sent Recognition",
    //    EntityType = "Recognition",
    //    EntityId = null, // Will be set after SaveChanges
    //    CreatedAt = DateTime.UtcNow
    //};
    //_db.ActivityLogs.Add(activityLog);

    //await _db.SaveChangesAsync(ct);

    //// Update activity log with recognition ID
    //activityLog.EntityId = recognition.RecognitionId;
    //await _db.SaveChangesAsync(ct);

    //// Notify managers in the target user's department
    //await NotifyManagersAsync(userId, dto.ToUserId, "Recognition", badge.BadgeName, ct);

    //return new MyRecognitionSubmitResultDto(
    //    recognition.RecognitionId,
    //    true,
    //    "Recognition submitted successfully",
    //    dto.Points
    //
    //
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

    // Create activity log
    var activityLog = new ActivityLog
    {
      UserId = userId,
      ActionType = "Sent Recognition",
      EntityType = "Recognition",
      EntityId = null, // Will be set after SaveChanges
      CreatedAt = DateTime.UtcNow
    };
    _db.ActivityLogs.Add(activityLog);

    // 5. Fire off notifications
    await NotifyManagersAsync(userId, dto.ToUserId, "Recognition", badgeName, ct);

    // 6. Return Result
    return new MyRecognitionResponseDto(
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
    //var query = _db.Recognitions
    //    .AsNoTracking()
    //    .Include(r => r.FromUser)
    //    .Include(r => r.ToUser)
    //    .Include(r => r.Badge)
    //    .Where(r => r.FromUserId == userId || r.ToUserId == userId);

    //// Filter by direction if specified
    //if (!string.IsNullOrWhiteSpace(direction))
    //{
    //  if (direction.Equals("given", StringComparison.OrdinalIgnoreCase))
    //    query = query.Where(r => r.FromUserId == userId);
    //  else if (direction.Equals("received", StringComparison.OrdinalIgnoreCase))
    //    query = query.Where(r => r.ToUserId == userId);
    //}

    //var recognitions = await query
    //    .OrderByDescending(r => r.CreatedAt)
    //    .ToListAsync(ct);

    //return recognitions.Select(r => new MyRecognitionDto(
    //    r.RecognitionId,
    //    r.FromUserId == userId ? "Given" : "Received",
    //    r.FromUserId == userId ? r.ToUserId : r.FromUserId,
    //    r.FromUserId == userId ? r.ToUser.FullName : r.FromUser.FullName,
    //    r.BadgeId,
    //    r.Badge.BadgeName,
    //    r.Points,
    //    r.Message,
    //    r.CreatedAt
    //)).ToList();

    // 1.Get raw entities from the database
    var recognitions = await recognitionRepository.GetUserRecognitionsAsync(userId, direction, ct);

    // 2. Map the List<Recognition> to List<MyRecognitionItemDto> using AutoMapper
    return mapper.Map<List<MyAllRecognitionItemDto>>(recognitions);
  }

  public async Task<MySummaryDto> GetMySummaryAsync(string userId, CancellationToken ct)
  {
    // Execute queries sequentially to avoid DbContext concurrency issues
    var feedbackGiven = await _db.Feedbacks.CountAsync(f => f.FromUserId == userId, ct);
    var feedbackReceived = await _db.Feedbacks.CountAsync(f => f.ToUserId == userId, ct);
    var recognitionGiven = await _db.Recognitions.CountAsync(r => r.FromUserId == userId, ct);
    var recognitionReceived = await _db.Recognitions.CountAsync(r => r.ToUserId == userId, ct);

    var pointsGiven = await _db.Recognitions
        .Where(r => r.FromUserId == userId)
        .SumAsync(r => (int?)r.Points, ct) ?? 0;

    var pointsReceived = await _db.Recognitions
        .Where(r => r.ToUserId == userId)
        .SumAsync(r => (int?)r.Points, ct) ?? 0;

    var lastFeedbackDate = await _db.Feedbacks
        .Where(f => f.FromUserId == userId || f.ToUserId == userId)
        .OrderByDescending(f => f.CreatedAt)
        .Select(f => (DateTime?)f.CreatedAt)
        .FirstOrDefaultAsync(ct);

    var lastRecognitionDate = await _db.Recognitions
        .Where(r => r.FromUserId == userId || r.ToUserId == userId)
        .OrderByDescending(r => r.CreatedAt)
        .Select(r => (DateTime?)r.CreatedAt)
        .FirstOrDefaultAsync(ct);

    var lastActivity = lastFeedbackDate.HasValue && lastRecognitionDate.HasValue
        ? (lastFeedbackDate > lastRecognitionDate ? lastFeedbackDate : lastRecognitionDate)
        : lastFeedbackDate ?? lastRecognitionDate;

    return new MySummaryDto(
        feedbackGiven,
        feedbackReceived,
        recognitionGiven,
        recognitionReceived,
        pointsGiven,
        pointsReceived,
        lastActivity
    );
  }
}
