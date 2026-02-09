namespace FeedbackSystem.API.Entities
{
    public class AppSetting
    {
        public string SettingKey { get; set; } = null!;
        public string SettingValue { get; set; } = null!;
        public DateTime UpdatedAt { get; set; }
    }
}
