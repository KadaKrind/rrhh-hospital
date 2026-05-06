using System.Text.Json.Serialization;

namespace MicroservicioRRHH.Models;

public class Turno
{
    public int Id { get; set; }
    public string CodigoTurno { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
    public string HoraInicio { get; set; } = null!;
    public string HoraFin { get; set; } = null!;
    public string Estado { get; set; } = "Activo";

    [JsonIgnore]
    public ICollection<EmpleadoTurnoDepartamento>? Asignaciones { get; set; }
}