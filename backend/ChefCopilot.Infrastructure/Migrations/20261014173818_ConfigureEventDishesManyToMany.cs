using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChefCopilot.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureEventDishesManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Dishes_Events_EventId",
                table: "Dishes");

            migrationBuilder.DropIndex(
                name: "IX_Dishes_EventId",
                table: "Dishes");

            migrationBuilder.DropColumn(
                name: "EventId",
                table: "Dishes");

            migrationBuilder.CreateTable(
                name: "EventDishes",
                columns: table => new
                {
                    EventId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    MenuDishesId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventDishes", x => new { x.EventId, x.MenuDishesId });
                    table.ForeignKey(
                        name: "FK_EventDishes_Dishes_MenuDishesId",
                        column: x => x.MenuDishesId,
                        principalTable: "Dishes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventDishes_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_EventDishes_MenuDishesId",
                table: "EventDishes",
                column: "MenuDishesId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventDishes");

            migrationBuilder.AddColumn<Guid>(
                name: "EventId",
                table: "Dishes",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.CreateIndex(
                name: "IX_Dishes_EventId",
                table: "Dishes",
                column: "EventId");

            migrationBuilder.AddForeignKey(
                name: "FK_Dishes_Events_EventId",
                table: "Dishes",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id");
        }
    }
}
