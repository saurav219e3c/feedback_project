using FeedbackSystem.API.DTOs.Admin;

namespace FeedbackSystem.API.Services.Interfaces;

public interface ISettingsService
{
    Task<AppSettingsDto> GetSettingsAsync(CancellationToken ct = default);
    Task SaveSettingsAsync(AppSettingsDto settings, CancellationToken ct = default);
}
