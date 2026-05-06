using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MicroservicioRRHH.Migrations
{
    /// <inheritdoc />
    public partial class AgregarDespidos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CargoId1",
                table: "Empleados",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Despidos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EmpleadoId = table.Column<int>(type: "integer", nullable: false),
                    Motivo = table.Column<string>(type: "text", nullable: false),
                    FechaDespido = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RegistradoPor = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Despidos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Despidos_Empleados_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_CargoId1",
                table: "Empleados",
                column: "CargoId1");

            migrationBuilder.CreateIndex(
                name: "IX_Despidos_EmpleadoId",
                table: "Despidos",
                column: "EmpleadoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Empleados_Cargos_CargoId1",
                table: "Empleados",
                column: "CargoId1",
                principalTable: "Cargos",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Empleados_Cargos_CargoId1",
                table: "Empleados");

            migrationBuilder.DropTable(
                name: "Despidos");

            migrationBuilder.DropIndex(
                name: "IX_Empleados_CargoId1",
                table: "Empleados");

            migrationBuilder.DropColumn(
                name: "CargoId1",
                table: "Empleados");
        }
    }
}
