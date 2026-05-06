namespace MicroservicioRRHH.Models;

public class Despido
{
    public int Id { get; set; }
    public int EmpleadoId { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public DateTime FechaDespido { get; set; }
    public string RegistradoPor { get; set; } = string.Empty;

    public Empleado Empleado { get; set; } = null!;
}