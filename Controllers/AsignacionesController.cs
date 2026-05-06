using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MicroservicioRRHH.Data;
using MicroservicioRRHH.Models;

namespace MicroservicioRRHH.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AsignacionesController : ControllerBase
{
    private readonly AppDbContext _db;
    public AsignacionesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var asignaciones = await _db.EmpleadoTurnoDepartamentos
            .Where(a => a.Estado == "Activo")
            .Select(a => new {
                a.CodigoAsignacion,
                a.EmpleadoId,
                a.TurnoId,
                a.DepartamentoId,
                a.FechaInicio
            }).ToListAsync();
        return Ok(asignaciones);
    }

    [HttpGet("{codigo}")]
    public async Task<IActionResult> GetByCodigo(string codigo)
    {
        var asignacion = await _db.EmpleadoTurnoDepartamentos
            .Where(a => a.CodigoAsignacion == codigo && a.Estado == "Activo")
            .Select(a => new {
                a.CodigoAsignacion,
                a.EmpleadoId,
                a.TurnoId,
                a.DepartamentoId,
                a.FechaInicio
            }).FirstOrDefaultAsync();

        if (asignacion == null) return NotFound(new { mensaje = "Asignación no encontrada." });
        return Ok(asignacion);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] EmpleadoTurnoDepartamento asignacion)
    {
        bool existe = await _db.EmpleadoTurnoDepartamentos
            .AnyAsync(a => a.CodigoAsignacion == asignacion.CodigoAsignacion);
        if (existe) return Conflict(new { mensaje = "Ya existe una asignación con ese código." });

        // Verificar integridad referencial por códigos
        bool empleadoExiste = await _db.Empleados.AnyAsync(e => e.Id == asignacion.EmpleadoId && e.Estado == "Activo");
        bool turnoExiste = await _db.Turnos.AnyAsync(t => t.Id == asignacion.TurnoId && t.Estado == "Activo");
        bool deptExiste = await _db.Departamentos.AnyAsync(d => d.Id == asignacion.DepartamentoId && d.Estado == "Activo");

        if (!empleadoExiste) return BadRequest(new { mensaje = "El empleado indicado no existe o está inactivo." });
        if (!turnoExiste) return BadRequest(new { mensaje = "El turno indicado no existe o está inactivo." });
        if (!deptExiste) return BadRequest(new { mensaje = "El departamento indicado no existe o está inactivo." });

        asignacion.Estado = "Activo";
        _db.EmpleadoTurnoDepartamentos.Add(asignacion);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByCodigo), new { codigo = asignacion.CodigoAsignacion },
            new { asignacion.CodigoAsignacion, asignacion.FechaInicio });
    }

    [HttpPut("{codigo}")]
    public async Task<IActionResult> Update(string codigo, [FromBody] EmpleadoTurnoDepartamento datos)
    {
        var asignacion = await _db.EmpleadoTurnoDepartamentos
            .FirstOrDefaultAsync(a => a.CodigoAsignacion == codigo && a.Estado == "Activo");
        if (asignacion == null) return NotFound(new { mensaje = "Asignación no encontrada." });

        asignacion.EmpleadoId = datos.EmpleadoId;
        asignacion.TurnoId = datos.TurnoId;
        asignacion.DepartamentoId = datos.DepartamentoId;
        asignacion.FechaInicio = datos.FechaInicio;

        await _db.SaveChangesAsync();
        return Ok(new { mensaje = "Asignación actualizada correctamente." });
    }

  
    [HttpDelete("{codigo}")]
    public async Task<IActionResult> Delete(string codigo)
    {
        var asignacion = await _db.EmpleadoTurnoDepartamentos
            .FirstOrDefaultAsync(a => a.CodigoAsignacion == codigo && a.Estado == "Activo");
        if (asignacion == null) return NotFound(new { mensaje = "Asignación no encontrada." });

        asignacion.Estado = "Inactivo";
        await _db.SaveChangesAsync();
        return Ok(new { mensaje = "Asignación desactivada correctamente." });
    }

   
    [HttpGet("join/empleado-turno")]
    public async Task<IActionResult> JoinEmpleadoTurno()
    {
        var resultado = await (
            from a in _db.EmpleadoTurnoDepartamentos
            join e in _db.Empleados on a.EmpleadoId equals e.Id
            join t in _db.Turnos on a.TurnoId equals t.Id
            where a.Estado == "Activo"
            select new
            {
                a.CodigoAsignacion,
                Empleado = e.Nombre + " " + e.Apellido,
                e.CodigoEmpleado,
                Turno = t.Descripcion,
                t.CodigoTurno,
                t.HoraInicio,
                t.HoraFin,
                a.FechaInicio
            }
        ).ToListAsync();

        return Ok(resultado);
    }

   
    [HttpGet("join/detalle-completo")]
    public async Task<IActionResult> JoinDetalleCompleto()
    {
        var resultado = await (
            from a in _db.EmpleadoTurnoDepartamentos
            join e in _db.Empleados on a.EmpleadoId equals e.Id
            join t in _db.Turnos on a.TurnoId equals t.Id
            join d in _db.Departamentos on a.DepartamentoId equals d.Id
            where a.Estado == "Activo"
            select new
            {
                a.CodigoAsignacion,
                Empleado = e.Nombre + " " + e.Apellido,
                e.CodigoEmpleado,
                Turno = t.Descripcion,
                t.CodigoTurno,
                t.HoraInicio,
                t.HoraFin,
                Departamento = d.Nombre,
                d.CodigoDepartamento,
                a.FechaInicio
            }
        ).ToListAsync();

        return Ok(resultado);
    }
}