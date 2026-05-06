using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MicroservicioRRHH.Data;
using MicroservicioRRHH.DTOs;
using MicroservicioRRHH.Models;
namespace MicroservicioRRHH.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MISController : ControllerBase
{
    private readonly AppDbContext _db;
    public MISController(AppDbContext db) => _db = db;

    [HttpGet("empleados-con-cargo")]
    public async Task<IActionResult> EmpleadosConCargo()
    {
        var resultado = await (from e in _db.Empleados
                               join c in _db.Cargos on e.CargoId equals c.Id
                               where e.Estado == "Activo"
                               select new
                               {
                                   e.CodigoEmpleado,
                                   Empleado = e.Nombre + " " + e.Apellido,
                                   e.Email,
                                   Cargo = c.Nombre,
                                   c.Descripcion
                               }).ToListAsync();
        return Ok(resultado);
    }

    [HttpGet("conteo-empleados-por-departamento")]
    public async Task<IActionResult> ConteoEmpleadosPorDepartamento()
    {
        var resultado = await (from etd in _db.EmpleadoTurnoDepartamentos
                               join d in _db.Departamentos on etd.DepartamentoId equals d.Id
                               where etd.Estado == "Activo"
                               group etd by d.Nombre into g
                               select new
                               {
                                   Departamento = g.Key,
                                   TotalEmpleados = g.Count()
                               }).ToListAsync();
        return Ok(resultado);
    }

    [HttpGet("suma-salarios-por-cargo")]
    public async Task<IActionResult> SumaSalariosPorCargo()
    {
        var resultado = await (from p in _db.Planillas
                               join c in _db.Cargos on p.CargoId equals c.Id
                               where p.Estado == "Activo"
                               group p by c.Nombre into g
                               select new
                               {
                                   Cargo = g.Key,
                                   TotalSueldoBase = g.Sum(x => x.SueldoBase),
                                   TotalSueldoNeto = g.Sum(x => x.SueldoNeto),
                                   TotalDescuentos = g.Sum(x => x.Descuentos)
                               }).ToListAsync();
        return Ok(resultado);
    }

    [HttpGet("buscar-empleado/{codigo}")]
    public async Task<IActionResult> BuscarEmpleadoPorCodigo(string codigo)
    {
        var resultado = await (from e in _db.Empleados
                               join c in _db.Cargos on e.CargoId equals c.Id
                               where e.CodigoEmpleado == codigo && e.Estado == "Activo"
                               select new
                               {
                                   e.Id,
                                   e.CodigoEmpleado,
                                   Empleado = e.Nombre + " " + e.Apellido,
                                   e.Ci,
                                   e.Email,
                                   e.Telefono,
                                   e.FechaIngreso,
                                   Cargo = c.Nombre
                               }).FirstOrDefaultAsync();
        if (resultado == null) return NotFound(new { mensaje = "Empleado no encontrado." });
        return Ok(resultado);
    }

    [HttpGet("empleados-sin-turno")]
    public async Task<IActionResult> EmpleadosSinTurno()
    {
        var resultado = await (from e in _db.Empleados
                               where e.Estado == "Activo" &&
                                     !_db.EmpleadoTurnoDepartamentos
                                         .Any(etd => etd.EmpleadoId == e.Id && etd.Estado == "Activo")
                               select new
                               {
                                   e.CodigoEmpleado,
                                   Empleado = e.Nombre + " " + e.Apellido,
                                   e.Email
                               }).ToListAsync();
        return Ok(resultado);
    }

    [HttpGet("empleados-por-departamento/{departamentoId:int}")]
    public async Task<IActionResult> EmpleadosPorDepartamento(int departamentoId)
    {
        var resultado = await (from etd in _db.EmpleadoTurnoDepartamentos
                               join e in _db.Empleados on etd.EmpleadoId equals e.Id
                               join d in _db.Departamentos on etd.DepartamentoId equals d.Id
                               join c in _db.Cargos on e.CargoId equals c.Id
                               where d.Id == departamentoId && etd.Estado == "Activo"
                               select new
                               {
                                   e.CodigoEmpleado,
                                   Empleado = e.Nombre + " " + e.Apellido,
                                   Cargo = c.Nombre,
                                   Departamento = d.Nombre
                               }).ToListAsync();
        return Ok(resultado);
    }

    [HttpGet("turnos-por-empleado/{empleadoId}")]
    public async Task<IActionResult> TurnosPorEmpleado(int empleadoId)
    {
        var resultado = await (from etd in _db.EmpleadoTurnoDepartamentos
                               join e in _db.Empleados on etd.EmpleadoId equals e.Id
                               join t in _db.Turnos on etd.TurnoId equals t.Id
                               join d in _db.Departamentos on etd.DepartamentoId equals d.Id
                               where e.Id == empleadoId && etd.Estado == "Activo"
                               select new
                               {
                                   Empleado = e.Nombre + " " + e.Apellido,
                                   Turno = t.Descripcion,
                                   t.HoraInicio,
                                   t.HoraFin,
                                   Departamento = d.Nombre
                               }).ToListAsync();
        return Ok(resultado);
    }

    [HttpGet("empleados-activos-detalle")]
    public async Task<IActionResult> EmpleadosActivosDetalle()
    {
        var resultado = await (from etd in _db.EmpleadoTurnoDepartamentos
                               join e in _db.Empleados on etd.EmpleadoId equals e.Id
                               join t in _db.Turnos on etd.TurnoId equals t.Id
                               join d in _db.Departamentos on etd.DepartamentoId equals d.Id
                               join c in _db.Cargos on e.CargoId equals c.Id
                               where e.Estado == "Activo" && etd.Estado == "Activo"
                               select new
                               {
                                   e.CodigoEmpleado,
                                   Empleado = e.Nombre + " " + e.Apellido,
                                   Cargo = c.Nombre,
                                   Turno = t.Descripcion,
                                   Departamento = d.Nombre
                               }).ToListAsync();
        return Ok(resultado);
    }

    [HttpGet("resumen-personal-departamentos")]
    public async Task<IActionResult> ResumenPersonalDepartamentos()
    {
        var resultado = await (from etd in _db.EmpleadoTurnoDepartamentos
                               join d in _db.Departamentos on etd.DepartamentoId equals d.Id
                               join e in _db.Empleados on etd.EmpleadoId equals e.Id
                               where etd.Estado == "Activo" && e.Estado == "Activo"
                               group etd by new { d.Nombre, d.CodigoDepartamento } into g
                               orderby g.Count() descending
                               select new
                               {
                                   Departamento = g.Key.Nombre,
                                   Codigo = g.Key.CodigoDepartamento,
                                   TotalPersonal = g.Count()
                               }).ToListAsync();
        return Ok(resultado);
    }

    [HttpGet("empleados-por-turno/{turnoId}")]
    public async Task<IActionResult> EmpleadosPorTurno(int turnoId)
    {
        var resultado = await (from etd in _db.EmpleadoTurnoDepartamentos
                               join e in _db.Empleados on etd.EmpleadoId equals e.Id
                               join t in _db.Turnos on etd.TurnoId equals t.Id
                               join d in _db.Departamentos on etd.DepartamentoId equals d.Id
                               where t.Id == turnoId && etd.Estado == "Activo"
                               select new
                               {
                                   Turno = t.Descripcion,
                                   e.CodigoEmpleado,
                                   Empleado = e.Nombre + " " + e.Apellido,
                                   Departamento = d.Nombre
                               }).ToListAsync();
        return Ok(resultado);
    }

    [HttpGet("resumen-personal-por-turno")]
    public async Task<IActionResult> ResumenPersonalPorTurno()
    {
        var resultado = await (from etd in _db.EmpleadoTurnoDepartamentos
                               join t in _db.Turnos on etd.TurnoId equals t.Id
                               where etd.Estado == "Activo"
                               group etd by t.Descripcion into g
                               select new
                               {
                                   Turno = g.Key,
                                   TotalEmpleados = g.Count()
                               }).ToListAsync();
        return Ok(resultado);
    }

    [HttpGet("empleados-por-gestion/{gestion}")]
    public async Task<IActionResult> EmpleadosPorGestion(string gestion)
    {
        var resultado = await (from p in _db.Planillas
                               join e in _db.Empleados on p.EmpleadoId equals e.Id
                               join c in _db.Cargos on p.CargoId equals c.Id
                               where p.Gestion == gestion && p.Estado == "Activo"
                               select new
                               {
                                   p.Gestion,
                                   e.CodigoEmpleado,
                                   Empleado = e.Nombre + " " + e.Apellido,
                                   Cargo = c.Nombre,
                                   p.SueldoNeto
                               }).ToListAsync();
        return Ok(resultado);
    }

    [HttpGet("departamentos-mas-personal")]
    public async Task<IActionResult> DepartamentosMasPersonal()
    {
        var resultado = await (from etd in _db.EmpleadoTurnoDepartamentos
                               join d in _db.Departamentos on etd.DepartamentoId equals d.Id
                               where etd.Estado == "Activo"
                               group etd by d.Nombre into g
                               orderby g.Count() descending
                               select new
                               {
                                   Departamento = g.Key,
                                   TotalEmpleados = g.Count()
                               }).Take(5).ToListAsync();
        return Ok(resultado);
    }

    [HttpGet("planilla-completa")]
    public async Task<IActionResult> PlanillaCompleta()
    {
        var resultado = await (from p in _db.Planillas
                               join e in _db.Empleados on p.EmpleadoId equals e.Id
                               join c in _db.Cargos on p.CargoId equals c.Id
                               where p.Estado == "Activo" && e.Estado == "Activo"
                               orderby p.Gestion, e.Apellido
                               select new
                               {
                                   p.Gestion,
                                   e.CodigoEmpleado,
                                   Empleado = e.Nombre + " " + e.Apellido,
                                   Cargo = c.Nombre,
                                   p.SueldoBase,
                                   p.Descuentos,
                                   p.SueldoNeto
                               }).ToListAsync();
        return Ok(resultado);
    }

    [HttpGet("contratos-por-tipo")]
    public async Task<IActionResult> ContratosPorTipo()
    {
        var resultado = await (from con in _db.Contratos
                               join e in _db.Empleados on con.EmpleadoId equals e.Id
                               where con.Estado == "Activo"
                               group con by con.TipoContrato into g
                               select new
                               {
                                   TipoContrato = g.Key,
                                   Total = g.Count()
                               }).ToListAsync();
        return Ok(resultado);
    }

    // ── NUEVOS ENDPOINTS ──────────────────────────────────────────────────────

    [HttpGet("empleados-por-cargo/{cargo}")]
    public async Task<IActionResult> EmpleadosPorCargo(string cargo)
    {
        var resultado = await (from e in _db.Empleados
                               join c in _db.Cargos on e.CargoId equals c.Id
                               where c.Nombre.ToLower().Contains(cargo.ToLower()) && e.Estado == "Activo"
                               select new
                               {
                                   e.CodigoEmpleado,
                                   Empleado = e.Nombre + " " + e.Apellido,
                                   e.Email,
                                   Cargo = c.Nombre
                               }).ToListAsync();

        if (!resultado.Any())
            return NotFound(new { mensaje = $"No se encontraron empleados con el cargo: {cargo}" });

        return Ok(resultado);
    }

    [HttpPost("despido")]
    public async Task<IActionResult> RegistrarDespido([FromBody] DespidoDTO despido)
    {
        var empleado = await _db.Empleados.FindAsync(despido.EmpleadoId);
        if (empleado == null)
            return NotFound(new { mensaje = "Empleado no encontrado" });

        empleado.Estado = "Inactivo";

        var registro = new Despido
        {
            EmpleadoId = despido.EmpleadoId,
            Motivo = despido.Motivo,
            FechaDespido = despido.FechaDespido,
            RegistradoPor = despido.RegistradoPor
        };

        _db.Despidos.Add(registro);
        await _db.SaveChangesAsync();

        return Ok(new { mensaje = "Despido registrado correctamente" });
    }

    [HttpGet("historial-despidos")]
    public async Task<IActionResult> HistorialDespidos()
    {
        var resultado = await (from d in _db.Despidos
                               join e in _db.Empleados on d.EmpleadoId equals e.Id
                               select new
                               {
                                   d.Id,
                                   Empleado = e.Nombre + " " + e.Apellido,
                                   e.CodigoEmpleado,
                                   d.Motivo,
                                   d.FechaDespido,
                                   d.RegistradoPor
                               }).ToListAsync();
        return Ok(resultado);
    }

    [HttpPut("empleado/{id}/cambiar-cargo")]
    public async Task<IActionResult> CambiarCargo(int id, [FromBody] CambioCargoDTO dto)
    {
        var empleado = await _db.Empleados.FindAsync(id);
        if (empleado == null)
            return NotFound(new { mensaje = "Empleado no encontrado" });

        var cargo = await _db.Cargos.FirstOrDefaultAsync(c => c.Nombre.ToLower() == dto.NuevoCargo.ToLower());
        if (cargo == null)
            return NotFound(new { mensaje = $"El cargo '{dto.NuevoCargo}' no existe" });

        empleado.CargoId = cargo.Id;
        await _db.SaveChangesAsync();

        return Ok(new { mensaje = "Cargo actualizado correctamente" });
    }
}