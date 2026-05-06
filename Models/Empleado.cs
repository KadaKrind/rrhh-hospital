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

    private DateTime _fechaIngreso;
    public DateTime FechaIngreso
    {
        get => _fechaIngreso;
        set => _fechaIngreso = DateTime.SpecifyKind(value, DateTimeKind.Utc);
    }

    private DateTime _fechaContratacion;
    public DateTime FechaContratacion
    {
        get => _fechaContratacion;
        set => _fechaContratacion = DateTime.SpecifyKind(value, DateTimeKind.Utc);
    }

    public decimal SalarioBase { get; set; }
    public int CargoId { get; set; }
    [JsonIgnore]
    public Cargo? Cargo { get; set; }

    public string Estado { get; set; } = "Activo";
    [JsonIgnore]
    public ICollection<EmpleadoTurnoDepartamento> Asignaciones { get; set; } = new List<EmpleadoTurnoDepartamento>();
}