using System.Text.Json.Serialization;

namespace MicroservicioRRHH.Models;

public class Contrato
{
    public int Id { get; set; }
    public string CodigoContrato { get; set; } = string.Empty;
    public string TipoContrato { get; set; } = string.Empty; // Item, Eventual, Consultoría
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
    public int EmpleadoId { get; set; }
    [JsonIgnore]
    public Empleado? Empleado { get; set; }
    public string Estado { get; set; } = "Activo";
}