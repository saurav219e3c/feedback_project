namespace FeedbackSystem.API.Entities
{
    public class Recognition
    {
        public int RecognitionId { get; set; }

        public string FromUserId { get; set; } = null!;
        public string ToUserId { get; set; } = null!;

        // ✅ Using Category table (same as Feedback)
        public string CategoryId { get; set; } = null!;

        // ✅ Points 1–10
        public int Points { get; set; }

        public string Message { get; set; } = null!;
        public DateTime CreatedAt { get; set; }

        public User FromUser { get; set; } = null!;
        public User ToUser { get; set; } = null!;
        public Category Category { get; set; } = null!;
    }
}
