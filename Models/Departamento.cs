using System.Text.Json.Serialization;

namespace MicroservicioRRHH.Models;

public class Departamento
{
    public int Id { get; set; }
    public string CodigoDepartamento { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public string Estado { get; set; } = "Activo";

    [JsonIgnore]
    public ICollection<EmpleadoTurnoDepartamento> Asignaciones { get; set; }
        = new List<EmpleadoTurnoDepartamento>();
}