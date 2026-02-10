using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FeedbackSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRecognitionCategoryAndPoints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Recognition",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Points",
                table: "Recognition",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Recognition_Points_Range",
                table: "Recognition",
                sql: "[Points] BETWEEN 1 AND 10");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Recognition_Points_Range",
                table: "Recognition");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Recognition");

            migrationBuilder.DropColumn(
                name: "Points",
                table: "Recognition");
        }
    }
}
