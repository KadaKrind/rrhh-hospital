using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MicroservicioRRHH.Data;
using MicroservicioRRHH.Models;

namespace MicroservicioRRHH.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlanillasController : ControllerBase
{
    private readonly AppDbContext _db;
    public PlanillasController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var lista = await (from p in _db.Planillas
                           join e in _db.Empleados on p.EmpleadoId equals e.Id
                           join c in _db.Cargos on p.CargoId equals c.Id
                           where p.Estado == "Activo"
                           select new
                           {
                               p.Id,
                               p.CodigoPlanilla,
                               Empleado = e.Nombre + " " + e.Apellido,
                               Cargo = c.Nombre,
                               p.SueldoBase,
                               p.Descuentos,
                               p.SueldoNeto,
                               p.Gestion
                           }).ToListAsync();
        return Ok(lista);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var planilla = await (from p in _db.Planillas
                              join e in _db.Empleados on p.EmpleadoId equals e.Id
                              join c in _db.Cargos on p.CargoId equals c.Id
                              where p.Id == id && p.Estado == "Activo"
                              select new
                              {
                                  p.Id,
                                  p.CodigoPlanilla,
                                  Empleado = e.Nombre + " " + e.Apellido,
                                  Cargo = c.Nombre,
                                  p.SueldoBase,
                                  p.Descuentos,
                                  p.SueldoNeto,
                                  p.Gestion
                              }).FirstOrDefaultAsync();
        if (planilla == null) return NotFound(new { mensaje = "Planilla no encontrada." });
        return Ok(planilla);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Planilla planilla)
    {
        bool existe = await _db.Planillas.AnyAsync(p => p.CodigoPlanilla == planilla.CodigoPlanilla);
        if (existe) return Conflict(new { mensaje = "Ya existe una planilla con ese código." });
        planilla.SueldoNeto = planilla.SueldoBase - planilla.Descuentos;
        planilla.Estado = "Activo";
        _db.Planillas.Add(planilla);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = planilla.Id }, planilla);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Planilla datos)
    {
        var planilla = await _db.Planillas.FirstOrDefaultAsync(p => p.Id == id && p.Estado == "Activo");
        if (planilla == null) return NotFound(new { mensaje = "Planilla no encontrada." });
        planilla.SueldoBase = datos.SueldoBase;
        planilla.Descuentos = datos.Descuentos;
        planilla.SueldoNeto = datos.SueldoBase - datos.Descuentos;
        planilla.Gestion = datos.Gestion;
        await _db.SaveChangesAsync();
        return Ok(new { mensaje = "Planilla actualizada." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var planilla = await _db.Planillas.FirstOrDefaultAsync(p => p.Id == id && p.Estado == "Activo");
        if (planilla == null) return NotFound(new { mensaje = "Planilla no encontrada." });
        planilla.Estado = "Inactivo";
        await _db.SaveChangesAsync();
        return Ok(new { mensaje = "Planilla desactivada." });
    }
}