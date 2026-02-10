namespace FeedbackSystem.API.Entities
{
    public class Role
    {

        public int RoleId { get; set; }
        public string RoleName { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();


    }
}
