using System.Text.Json.Serialization;

namespace MicroservicioRRHH.Models;

public class EmpleadoTurnoDepartamento
{
    public int Id { get; set; }
    public string CodigoAsignacion { get; set; } = null!;

    public int EmpleadoId { get; set; }
    public int TurnoId { get; set; }
    public int DepartamentoId { get; set; }

    public DateTime FechaInicio { get; set; }
    public string Estado { get; set; } = "Activo";

    [JsonIgnore]
    public Empleado? Empleado { get; set; }
    [JsonIgnore]
    public Turno? Turno { get; set; }
    [JsonIgnore]
    public Departamento? Departamento { get; set; }
}