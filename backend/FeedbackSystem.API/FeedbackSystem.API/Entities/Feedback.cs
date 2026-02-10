namespace FeedbackSystem.API.Entities
{
    public class Feedback
    {
        public int FeedbackId { get; set; }
        public int FromUserId { get; set; }
        public int ToUserId { get; set; }
        public int CategoryId { get; set; }
        public string Comments { get; set; } = null!;
        public bool IsAnonymous { get; set; }
        public DateTime CreatedAt { get; set; }

        public User FromUser { get; set; } = null!;
        public User ToUser { get; set; } = null!;
        public Category Category { get; set; } = null!;
        public ICollection<FeedbackReview> Reviews { get; set; } = new List<FeedbackReview>();
    }
}
