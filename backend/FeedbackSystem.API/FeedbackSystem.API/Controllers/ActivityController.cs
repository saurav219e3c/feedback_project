using FeedbackSystem.API.DTOs;
using FeedbackSystem.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FeedbackSystem.API.Controllers;

[ApiController]
[Route("api/activity")]
[AllowAnonymous]
public class ActivityController : ControllerBase
{
    private readonly IActivityService _service;


    public ActivityController(IActivityService service) => _service = service;

    // GET /api/activity/logs
    [HttpGet("logs")]
    public async Task<ActionResult<List<ActivityItemDto>>> GetLogs(CancellationToken ct)
        => Ok(await _service.GetAllAsync(ct));
}
