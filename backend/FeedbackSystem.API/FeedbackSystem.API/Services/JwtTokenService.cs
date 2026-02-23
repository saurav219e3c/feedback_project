using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FeedbackSystem.API.Entities;
using FeedbackSystem.API.Options;
using FeedbackSystem.API.Services.interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FeedbackSystem.API.Services;

public class JwtTokenService : IJwtTokenService
{
  private readonly JwtOptions _opt;

  public JwtTokenService(IOptions<JwtOptions> options)
  {
    _opt = options.Value;
  }

  public (string token, DateTime expiresAt) CreateToken(User user)
  {
    // 1. Guard: Check for missing OR dangerously short keys
    if (string.IsNullOrWhiteSpace(_opt.Key) || _opt.Key.Length < 32)
      throw new InvalidOperationException("JWT Key is missing or too short. It must be at least 32 characters long.");

    var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opt.Key));
    var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

    // 2. Streamlined Claims (Removed redundancies)
    var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId), // The standard .NET way to store User ID
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("DepartmentId", user.DepartmentId.ToString()) // Added back from your Entity
        };

    // 3. Add Role safely
    if (!string.IsNullOrWhiteSpace(user.Role?.RoleName))
    {
      claims.Add(new Claim(ClaimTypes.Role, user.Role.RoleName));
    }

    var expiresAt = DateTime.UtcNow.AddMinutes(_opt.ExpiryMinutes);

    // 4. Token Generation
    var token = new JwtSecurityToken(
        issuer: _opt.Issuer,
        audience: _opt.Audience,
        claims: claims,
        notBefore: DateTime.UtcNow.AddSeconds(-5), // Prevents tiny clock-skew errors
        expires: expiresAt,
        signingCredentials: credentials
    );

    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
    return (tokenString, expiresAt);
  }
}
