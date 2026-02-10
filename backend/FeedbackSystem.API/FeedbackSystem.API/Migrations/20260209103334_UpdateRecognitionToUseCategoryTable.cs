using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FeedbackSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRecognitionToUseCategoryTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Add CategoryId column as nullable first
            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "Recognition",
                type: "int",
                nullable: true);

            // Step 2: Map existing Category strings to CategoryId
            // Try to match existing text categories to database categories
            // If no match found, use first available category as default
            migrationBuilder.Sql(@"
                -- Update CategoryId based on existing Category text (best-effort match)
                UPDATE r
                SET r.CategoryId = c.CategoryId
                FROM Recognition r
                JOIN Categories c ON LOWER(r.Category) = LOWER(c.CategoryName)
                WHERE r.CategoryId IS NULL;

                -- For unmapped records, set to first available category (General or first in list)
                DECLARE @DefaultCategoryId INT;
                SELECT TOP 1 @DefaultCategoryId = CategoryId FROM Categories WHERE IsActive = 1 ORDER BY CategoryId;
                
                UPDATE Recognition
                SET CategoryId = @DefaultCategoryId
                WHERE CategoryId IS NULL;
            ");

            // Step 3: Make CategoryId non-nullable
            migrationBuilder.AlterColumn<int>(
                name: "CategoryId",
                table: "Recognition",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            // Step 4: Create index
            migrationBuilder.CreateIndex(
                name: "IX_Recognition_CategoryId",
                table: "Recognition",
                column: "CategoryId");

            // Step 5: Add foreign key constraint
            migrationBuilder.AddForeignKey(
                name: "FK_Recognition_Category",
                table: "Recognition",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Restrict);

            // Step 6: Drop old Category column
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Recognition");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Recognition_Category",
                table: "Recognition");

            migrationBuilder.DropIndex(
                name: "IX_Recognition_CategoryId",
                table: "Recognition");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Recognition");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Recognition",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
