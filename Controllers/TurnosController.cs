using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MicroservicioRRHH.Data;
using MicroservicioRRHH.Models;

namespace MicroservicioRRHH.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TurnosController : ControllerBase
{
    private readonly AppDbContext _db;
    public TurnosController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var turnos = await _db.Turnos
            .Where(t => t.Estado == "Activo")
            .Select(t => new {
                t.CodigoTurno,
                t.Descripcion,
                t.HoraInicio,
                t.HoraFin
            }).ToListAsync();
        return Ok(turnos);
    }

    [HttpGet("{codigo}")]
    public async Task<IActionResult> GetByCodigo(string codigo)
    {
        var turno = await _db.Turnos
            .Where(t => t.CodigoTurno == codigo && t.Estado == "Activo")
            .Select(t => new {
                t.CodigoTurno,
                t.Descripcion,
                t.HoraInicio,
                t.HoraFin
            }).FirstOrDefaultAsync();

        if (turno == null) return NotFound(new { mensaje = "Turno no encontrado." });
        return Ok(turno);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Turno turno)
    {
        bool existe = await _db.Turnos.AnyAsync(t => t.CodigoTurno == turno.CodigoTurno);
        if (existe) return Conflict(new { mensaje = "Ya existe un turno con ese código." });

        turno.Estado = "Activo";
        _db.Turnos.Add(turno);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetByCodigo), new { codigo = turno.CodigoTurno },
            new { turno.CodigoTurno, turno.Descripcion });
    }

    [HttpPut("{codigo}")]
    public async Task<IActionResult> Update(string codigo, [FromBody] Turno datos)
    {
        var turno = await _db.Turnos.FirstOrDefaultAsync(t => t.CodigoTurno == codigo && t.Estado == "Activo");
        if (turno == null) return NotFound(new { mensaje = "Turno no encontrado." });

        turno.Descripcion = datos.Descripcion;
        turno.HoraInicio = datos.HoraInicio;
        turno.HoraFin = datos.HoraFin;

        await _db.SaveChangesAsync();
        return Ok(new { mensaje = "Turno actualizado correctamente." });
    }

    [HttpDelete("{codigo}")]
    public async Task<IActionResult> Delete(string codigo)
    {
        var turno = await _db.Turnos.FirstOrDefaultAsync(t => t.CodigoTurno == codigo && t.Estado == "Activo");
        if (turno == null) return NotFound(new { mensaje = "Turno no encontrado." });

        turno.Estado = "Inactivo";
        await _db.SaveChangesAsync();
        return Ok(new { mensaje = "Turno desactivado correctamente." });
    }
}