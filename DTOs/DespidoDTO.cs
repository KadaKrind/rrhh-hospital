namespace MicroservicioRRHH.DTOs;

public class DespidoDTO
{
    public int EmpleadoId { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public DateTime FechaDespido { get; set; }
    public string RegistradoPor { get; set; } = string.Empty;
}