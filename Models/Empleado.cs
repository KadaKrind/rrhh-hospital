using System.Text.Json.Serialization;

namespace MicroservicioRRHH.Models;

public class Empleado
{
    public int Id { get; set; }
    public string CodigoEmpleado { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Ci { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public DateTime FechaIngreso { get; set; }
    public DateTime FechaContratacion { get; set; }
    public decimal SalarioBase { get; set; }
    public int CargoId { get; set; }
    [JsonIgnore]
    public Cargo? Cargo { get; set; }
  
    public string Estado { get; set; } = "Activo";
    [JsonIgnore]
    public ICollection<EmpleadoTurnoDepartamento> Asignaciones { get; set; } = new List<EmpleadoTurnoDepartamento>();
}