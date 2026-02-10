namespace FeedbackSystem.API.DTOs;

public record ActivityItemDto(
    string Time,
    string User,
    string Action,
    string Details
);
