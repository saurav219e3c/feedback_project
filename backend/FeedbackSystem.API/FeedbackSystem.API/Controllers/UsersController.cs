using FeedbackSystem.API.DTOs;
using FeedbackSystem.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FeedbackSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;
    public UsersController(IUserService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<List<UserReadDto>>> GetAll(CancellationToken ct)
        => Ok(await _service.GetAllAsync(ct));

    [HttpGet("{id}")]
    public async Task<ActionResult<UserReadDto>> Get(string id, CancellationToken ct)
    {
        var user = await _service.GetByIdAsync(id, ct);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserReadDto>> Create(UserCreateDto dto, CancellationToken ct)
    {
        var created = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(Get), new { id = created.UserId }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, UserUpdateDto dto, CancellationToken ct)
        => await _service.UpdateAsync(id, dto, ct) ? NoContent() : NotFound();

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
        => await _service.DeleteAsync(id, ct) ? NoContent() : NotFound();

    // ✅ Statistics endpoint
    [HttpGet("stats")]
    public async Task<ActionResult<UserStatsDto>> GetStats(CancellationToken ct)
        => Ok(await _service.GetStatsAsync(ct));

    /// <summary>
    /// GET /api/users/search?query={searchTerm}
    /// Search for users by name or email (accessible to all authenticated users)
    /// </summary>
    [HttpGet("search")]
    [AllowAnonymous] // Override the controller-level [Authorize(Roles = "Admin")]
    [Authorize] // But still require authentication (any role)
    public async Task<ActionResult<List<UserReadDto>>> Search([FromQuery] string search, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(search) || search.Length < 2)
            return Ok(new List<UserReadDto>());

        var results = await _service.SearchAsync(search, ct);
        return Ok(results);
    }
}