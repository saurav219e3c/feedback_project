namespace FeedbackSystem.API.DTOs
{
    // Dashboard summary statistics
    public record DashboardSummaryDto(
        int TotalUsers,
        int ActiveUsers,
        int TotalFeedback,
        int TotalRecognition
    );

    // Weekly trend data for a specific month
    public record WeeklyTrendDto(
        string[] Labels,           // e.g., ["Week 1", "Week 2", "Week 3", "Week 4"]
        int[] FeedbackCounts,      // Feedback counts per week
        int[] RecognitionCounts,   // Recognition counts per week
        int Year,                  // Year of the data
        int Month                  // Month of the data (1-12)
    );

    // Department feedback/recognition counts
    public record DepartmentCountDto(
        string DepartmentId,
        string DepartmentName,
        int Count
    );

    // Top employees by points
    public record TopEmployeeDto(
        string UserId,
        string FullName,
        int Points
    );

    // Recognition given/received by department
    public record DepartmentRecognitionDto(
        string DepartmentId,
        string DepartmentName,
        int GivenCount,
        int ReceivedCount
    );

    // Category average scores
    public record CategoryAverageScoreDto(
        string CategoryId,
        string CategoryName,
        double AverageScore
    );
}
