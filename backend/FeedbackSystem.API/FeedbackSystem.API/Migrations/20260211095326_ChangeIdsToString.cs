using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FeedbackSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class ChangeIdsToString : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // WARNING: This migration will delete all existing data
            // Drop all foreign key constraints first
            migrationBuilder.Sql(@"
                -- Drop FK constraints (check if exists to avoid errors)
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Users_Departments')
                    ALTER TABLE [Users] DROP CONSTRAINT [FK_Users_Departments];
                
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Feedback_FromUser')
                    ALTER TABLE [Feedback] DROP CONSTRAINT [FK_Feedback_FromUser];
                
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Feedback_ToUser')
                    ALTER TABLE [Feedback] DROP CONSTRAINT [FK_Feedback_ToUser];
                
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Feedback_Category')
                    ALTER TABLE [Feedback] DROP CONSTRAINT [FK_Feedback_Category];
                
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Recognition_FromUser')
                    ALTER TABLE [Recognition] DROP CONSTRAINT [FK_Recognition_FromUser];
                
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Recognition_ToUser')
                    ALTER TABLE [Recognition] DROP CONSTRAINT [FK_Recognition_ToUser];
                
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Recognition_Category')
                    ALTER TABLE [Recognition] DROP CONSTRAINT [FK_Recognition_Category];
                
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ActivityLog_User')
                    ALTER TABLE [ActivityLog] DROP CONSTRAINT [FK_ActivityLog_User];
                
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Notification_User')
                    ALTER TABLE [Notifications] DROP CONSTRAINT [FK_Notification_User];
                
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_FeedbackReview_User')
                    ALTER TABLE [FeedbackReview] DROP CONSTRAINT [FK_FeedbackReview_User];
            ");

            // Truncate all tables
            migrationBuilder.Sql(@"
                DELETE FROM [FeedbackReview];
                DELETE FROM [Feedback];
                DELETE FROM [Recognition];
                DELETE FROM [ActivityLog];
                DELETE FROM [Notifications];
                DELETE FROM [Users];
                DELETE FROM [Departments];
                DELETE FROM [Categories];
            ");

            // Drop indexes that depend on columns we're changing
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_DepartmentId')
                    DROP INDEX [IX_Users_DepartmentId] ON [Users];
                
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Feedback_FromUserId')
                    DROP INDEX [IX_Feedback_FromUserId] ON [Feedback];
                
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Feedback_ToUserId')
                    DROP INDEX [IX_Feedback_ToUserId] ON [Feedback];
                
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Feedback_CategoryId')
                    DROP INDEX [IX_Feedback_CategoryId] ON [Feedback];
                
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Recognition_FromUserId')
                    DROP INDEX [IX_Recognition_FromUserId] ON [Recognition];
                
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Recognition_ToUserId')
                    DROP INDEX [IX_Recognition_ToUserId] ON [Recognition];
                
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Recognition_CategoryId')
                    DROP INDEX [IX_Recognition_CategoryId] ON [Recognition];
                
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ActivityLog_UserId')
                    DROP INDEX [IX_ActivityLog_UserId] ON [ActivityLog];
                
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_UserId')
                    DROP INDEX [IX_Notifications_UserId] ON [Notifications];
                
                IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_FeedbackReview_ReviewedBy')
                    DROP INDEX [IX_FeedbackReview_ReviewedBy] ON [FeedbackReview];
            ");

            // Drop and recreate primary key columns for Users
            migrationBuilder.Sql(@"
                ALTER TABLE [Users] DROP CONSTRAINT [PK_Users];
                ALTER TABLE [Users] DROP COLUMN [UserId];
                ALTER TABLE [Users] ADD [UserId] NVARCHAR(20) NOT NULL;
                ALTER TABLE [Users] ADD CONSTRAINT [PK_Users] PRIMARY KEY ([UserId]);
            ");

            // Change DepartmentId FK in Users
            migrationBuilder.Sql(@"
                ALTER TABLE [Users] DROP COLUMN [DepartmentId];
                ALTER TABLE [Users] ADD [DepartmentId] NVARCHAR(20) NOT NULL;
            ");

            // Drop and recreate primary key for Departments
            migrationBuilder.Sql(@"
                ALTER TABLE [Departments] DROP CONSTRAINT [PK_Departments];
                ALTER TABLE [Departments] DROP COLUMN [DepartmentId];
                ALTER TABLE [Departments] ADD [DepartmentId] NVARCHAR(20) NOT NULL;
                ALTER TABLE [Departments] ADD CONSTRAINT [PK_Departments] PRIMARY KEY ([DepartmentId]);
            ");

            // Drop and recreate primary key for Categories
            migrationBuilder.Sql(@"
                ALTER TABLE [Categories] DROP CONSTRAINT [PK_Categories];
                ALTER TABLE [Categories] DROP COLUMN [CategoryId];
                ALTER TABLE [Categories] ADD [CategoryId] NVARCHAR(20) NOT NULL;
                ALTER TABLE [Categories] ADD CONSTRAINT [PK_Categories] PRIMARY KEY ([CategoryId]);
            ");

            // Change FK columns in Feedback
            migrationBuilder.Sql(@"
                ALTER TABLE [Feedback] DROP COLUMN [FromUserId];
                ALTER TABLE [Feedback] ADD [FromUserId] NVARCHAR(20) NOT NULL;
                ALTER TABLE [Feedback] DROP COLUMN [ToUserId];
                ALTER TABLE [Feedback] ADD [ToUserId] NVARCHAR(20) NOT NULL;
                ALTER TABLE [Feedback] DROP COLUMN [CategoryId];
                ALTER TABLE [Feedback] ADD [CategoryId] NVARCHAR(20) NOT NULL;
            ");

            // Change FK columns in Recognition
            migrationBuilder.Sql(@"
                ALTER TABLE [Recognition] DROP COLUMN [FromUserId];
                ALTER TABLE [Recognition] ADD [FromUserId] NVARCHAR(20) NOT NULL;
                ALTER TABLE [Recognition] DROP COLUMN [ToUserId];
                ALTER TABLE [Recognition] ADD [ToUserId] NVARCHAR(20) NOT NULL;
                ALTER TABLE [Recognition] DROP COLUMN [CategoryId];
                ALTER TABLE [Recognition] ADD [CategoryId] NVARCHAR(20) NOT NULL;
            ");

            // Change FK columns in ActivityLog
            migrationBuilder.Sql(@"
                ALTER TABLE [ActivityLog] DROP COLUMN [UserId];
                ALTER TABLE [ActivityLog] ADD [UserId] NVARCHAR(20) NOT NULL;
            ");

            // Change FK columns in Notifications
            migrationBuilder.Sql(@"
                ALTER TABLE [Notifications] DROP COLUMN [UserId];
                ALTER TABLE [Notifications] ADD [UserId] NVARCHAR(20) NOT NULL;
            ");

            // Change FK columns in FeedbackReview
            migrationBuilder.Sql(@"
                ALTER TABLE [FeedbackReview] DROP COLUMN [ReviewedBy];
                ALTER TABLE [FeedbackReview] ADD [ReviewedBy] NVARCHAR(20) NOT NULL;
            ");

            // Recreate foreign key constraints
            migrationBuilder.Sql(@"
                ALTER TABLE [Users] ADD CONSTRAINT [FK_Users_Departments] 
                    FOREIGN KEY ([DepartmentId]) REFERENCES [Departments]([DepartmentId]) ON DELETE NO ACTION;
                
                ALTER TABLE [Feedback] ADD CONSTRAINT [FK_Feedback_FromUser] 
                    FOREIGN KEY ([FromUserId]) REFERENCES [Users]([UserId]) ON DELETE NO ACTION;
                
                ALTER TABLE [Feedback] ADD CONSTRAINT [FK_Feedback_ToUser] 
                    FOREIGN KEY ([ToUserId]) REFERENCES [Users]([UserId]) ON DELETE NO ACTION;
                
                ALTER TABLE [Feedback] ADD CONSTRAINT [FK_Feedback_Category] 
                    FOREIGN KEY ([CategoryId]) REFERENCES [Categories]([CategoryId]) ON DELETE NO ACTION;
                
                ALTER TABLE [Recognition] ADD CONSTRAINT [FK_Recognition_FromUser] 
                    FOREIGN KEY ([FromUserId]) REFERENCES [Users]([UserId]) ON DELETE NO ACTION;
                
                ALTER TABLE [Recognition] ADD CONSTRAINT [FK_Recognition_ToUser] 
                    FOREIGN KEY ([ToUserId]) REFERENCES [Users]([UserId]) ON DELETE NO ACTION;
                
                ALTER TABLE [Recognition] ADD CONSTRAINT [FK_Recognition_Category] 
                    FOREIGN KEY ([CategoryId]) REFERENCES [Categories]([CategoryId]) ON DELETE NO ACTION;
                
                ALTER TABLE [ActivityLog] ADD CONSTRAINT [FK_ActivityLog_User] 
                    FOREIGN KEY ([UserId]) REFERENCES [Users]([UserId]) ON DELETE CASCADE;
                
                ALTER TABLE [Notifications] ADD CONSTRAINT [FK_Notification_User] 
                    FOREIGN KEY ([UserId]) REFERENCES [Users]([UserId]) ON DELETE CASCADE;
                
                ALTER TABLE [FeedbackReview] ADD CONSTRAINT [FK_FeedbackReview_User] 
                    FOREIGN KEY ([ReviewedBy]) REFERENCES [Users]([UserId]) ON DELETE NO ACTION;
            ");

            // Recreate indexes
            migrationBuilder.Sql(@"
                CREATE INDEX [IX_Users_DepartmentId] ON [Users]([DepartmentId]);
                CREATE INDEX [IX_Feedback_FromUserId] ON [Feedback]([FromUserId]);
                CREATE INDEX [IX_Feedback_ToUserId] ON [Feedback]([ToUserId]);
                CREATE INDEX [IX_Feedback_CategoryId] ON [Feedback]([CategoryId]);
                CREATE INDEX [IX_Recognition_FromUserId] ON [Recognition]([FromUserId]);
                CREATE INDEX [IX_Recognition_ToUserId] ON [Recognition]([ToUserId]);
                CREATE INDEX [IX_Recognition_CategoryId] ON [Recognition]([CategoryId]);
                CREATE INDEX [IX_ActivityLog_UserId] ON [ActivityLog]([UserId]);
                CREATE INDEX [IX_Notifications_UserId] ON [Notifications]([UserId]);
                CREATE INDEX [IX_FeedbackReview_ReviewedBy] ON [FeedbackReview]([ReviewedBy]);
            ");
        }


        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Rollback not supported - would require recreating tables with INT IDENTITY columns
            throw new NotSupportedException("Rolling back this migration is not supported. Database must be recreated.");
        }
    }
}
