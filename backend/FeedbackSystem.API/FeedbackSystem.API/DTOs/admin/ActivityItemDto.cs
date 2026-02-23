namespace FeedbackSystem.API.DTOs.admin;

public record ActivityItemDto(
    string Time,
    string User,
    string Action,
    string Details
);
