using FeedbackSystem.API.Entities;

namespace FeedbackSystem.API.Services.interfaces;


public interface IJwtTokenService
{
    (string token, DateTime expiresAt) CreateToken(User user);
}

