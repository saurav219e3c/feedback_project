namespace FeedbackSystem.API.DTOs.Admin;

public record ActivityItemDto(
    string Time,
    string User,
    string Action,
    string Details
);
