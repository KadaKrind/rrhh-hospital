using System.Text.Json.Serialization;

namespace MicroservicioRRHH.Models;

public class Cargo
{
    public int Id { get; set; }
    public string CodigoCargo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Estado { get; set; } = "Activo";
    [JsonIgnore]
    public ICollection<Empleado>? Empleados { get; set; }
}