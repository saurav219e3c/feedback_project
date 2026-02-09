namespace FeedbackSystem.API.Entities
{
    public class Recognition
    {
        public int RecognitionId { get; set; }
        public int FromUserId { get; set; }
        public int ToUserId { get; set; }
        public string Message { get; set; } = null!;
        public DateTime CreatedAt { get; set; }

        public User FromUser { get; set; } = null!;
        public User ToUser { get; set; } = null!;
    }
}
