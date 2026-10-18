using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChefCopilot.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInventoryAndPieceYield : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CurrentStock",
                table: "Ingredients",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "IsPurchasedByPiece",
                table: "Ingredients",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxPortionsPerPiece",
                table: "Ingredients",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinPortionsPerPiece",
                table: "Ingredients",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MinimumStock",
                table: "Ingredients",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ReusableWastePercentage",
                table: "Ingredients",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentStock",
                table: "Ingredients");

            migrationBuilder.DropColumn(
                name: "IsPurchasedByPiece",
                table: "Ingredients");

            migrationBuilder.DropColumn(
                name: "MaxPortionsPerPiece",
                table: "Ingredients");

            migrationBuilder.DropColumn(
                name: "MinPortionsPerPiece",
                table: "Ingredients");

            migrationBuilder.DropColumn(
                name: "MinimumStock",
                table: "Ingredients");

            migrationBuilder.DropColumn(
                name: "ReusableWastePercentage",
                table: "Ingredients");
        }
    }
}
