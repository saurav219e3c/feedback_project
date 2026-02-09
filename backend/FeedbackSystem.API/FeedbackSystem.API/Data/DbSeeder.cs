using FeedbackSystem.API.Entities;
using FeedbackSystem.API.Security;
using Microsoft.EntityFrameworkCore;

namespace FeedbackSystem.API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        if (!await db.Roles.AnyAsync())
        {
            db.Roles.AddRange(
                new Role { RoleName = "Admin", IsActive = true },
                new Role { RoleName = "Manager", IsActive = true },
                new Role { RoleName = "Employee", IsActive = true }
            );
        }

        if (!await db.AppSettings.AnyAsync())
        {
            db.AppSettings.AddRange(
                new AppSetting { SettingKey = "feedbackEnabled", SettingValue = "true" },
                new AppSetting { SettingKey = "anonymous", SettingValue = "false" },
                new AppSetting { SettingKey = "recognitionEnabled", SettingValue = "true" },
                new AppSetting { SettingKey = "MaxFeedPerMonth", SettingValue = "5" }
            );
        }

        await db.SaveChangesAsync();

        var adminRole = await db.Roles.FirstAsync(r => r.RoleName == "Admin");
        if (!await db.Users.AnyAsync(u => u.Email == "admin@local"))
        {
            db.Users.Add(new User
            {
                FullName = "System Administrator",
                Email = "admin@local",
                PasswordHash = PasswordHasher.Hash("Admin@123"),
                RoleId = adminRole.RoleId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
        }
    }
}