using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChefCopilot.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEventDietaryRequirements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EventDietaryRequirements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    EventId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    RequirementName = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    GuestCount = table.Column<int>(type: "int", nullable: false),
                    ReplacedDishId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    SubstituteDishId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    Notes = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventDietaryRequirements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventDietaryRequirements_Dishes_ReplacedDishId",
                        column: x => x.ReplacedDishId,
                        principalTable: "Dishes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_EventDietaryRequirements_Dishes_SubstituteDishId",
                        column: x => x.SubstituteDishId,
                        principalTable: "Dishes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_EventDietaryRequirements_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_EventDietaryRequirements_EventId",
                table: "EventDietaryRequirements",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventDietaryRequirements_ReplacedDishId",
                table: "EventDietaryRequirements",
                column: "ReplacedDishId");

            migrationBuilder.CreateIndex(
                name: "IX_EventDietaryRequirements_SubstituteDishId",
                table: "EventDietaryRequirements",
                column: "SubstituteDishId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventDietaryRequirements");
        }
    }
}
