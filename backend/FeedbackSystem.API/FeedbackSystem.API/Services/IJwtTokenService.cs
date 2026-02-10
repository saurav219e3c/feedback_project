using FeedbackSystem.API.Entities;

namespace FeedbackSystem.API.Services;


public interface IJwtTokenService
{
    (string token, DateTime expiresAt) CreateToken(User user);
}

