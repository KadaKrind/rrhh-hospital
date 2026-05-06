using System.Text.Json.Serialization;

namespace MicroservicioRRHH.Models;

public class Planilla
{
    public int Id { get; set; }
    public string CodigoPlanilla { get; set; } = string.Empty;
    public int EmpleadoId { get; set; }
    [JsonIgnore]
    public Empleado? Empleado { get; set; }
    public int CargoId { get; set; }
    [JsonIgnore]
    public Cargo? Cargo { get; set; }
    public decimal SueldoBase { get; set; }
    public decimal Descuentos { get; set; }
    public decimal SueldoNeto { get; set; }
    public string Gestion { get; set; } = string.Empty; // Ej: "2024-1"
    public string Estado { get; set; } = "Activo";
}