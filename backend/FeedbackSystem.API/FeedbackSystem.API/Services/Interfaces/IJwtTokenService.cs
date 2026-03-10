using FeedbackSystem.API.Entities;

namespace FeedbackSystem.API.Services.Interfaces;


public interface IJwtTokenService
{
    (string token, DateTime expiresAt) CreateToken(User user);
}

