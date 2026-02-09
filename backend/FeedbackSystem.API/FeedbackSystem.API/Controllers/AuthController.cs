using FeedbackSystem.API.DTOs;
using FeedbackSystem.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FeedbackSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto dto, CancellationToken ct)
    {
        var result = await _auth.LoginAsync(dto, ct);
        if (result is null)
            return Unauthorized(new { message = "Invalid credentials or inactive user." });

        return Ok(result);
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserReadDto>> Register([FromBody] RegisterUserDto dto, CancellationToken ct)
    {
        var user = await _auth.RegisterAsync(dto, ct);
        return CreatedAtAction(nameof(Register), new { id = user.UserId }, user);
    }
}