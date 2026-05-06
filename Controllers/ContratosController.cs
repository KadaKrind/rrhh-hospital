using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MicroservicioRRHH.Data;
using MicroservicioRRHH.Models;

namespace MicroservicioRRHH.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContratosController : ControllerBase
{
    private readonly AppDbContext _db;
    public ContratosController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var lista = await (from c in _db.Contratos
                           join e in _db.Empleados on c.EmpleadoId equals e.Id
                           where c.Estado == "Activo"
                           select new
                           {
                               c.Id,
                               c.CodigoContrato,
                               c.TipoContrato,
                               c.FechaInicio,
                               c.FechaFin,
                               Empleado = e.Nombre + " " + e.Apellido
                           }).ToListAsync();
        return Ok(lista);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var contrato = await (from c in _db.Contratos
                              join e in _db.Empleados on c.EmpleadoId equals e.Id
                              where c.Id == id && c.Estado == "Activo"
                              select new
                              {
                                  c.Id,
                                  c.CodigoContrato,
                                  c.TipoContrato,
                                  c.FechaInicio,
                                  c.FechaFin,
                                  Empleado = e.Nombre + " " + e.Apellido
                              }).FirstOrDefaultAsync();
        if (contrato == null) return NotFound(new { mensaje = "Contrato no encontrado." });
        return Ok(contrato);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Contrato contrato)
    {
        bool existe = await _db.Contratos.AnyAsync(c => c.CodigoContrato == contrato.CodigoContrato);
        if (existe) return Conflict(new { mensaje = "Ya existe un contrato con ese código." });
        contrato.Estado = "Activo";
        _db.Contratos.Add(contrato);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = contrato.Id }, contrato);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Contrato datos)
    {
        var contrato = await _db.Contratos.FirstOrDefaultAsync(c => c.Id == id && c.Estado == "Activo");
        if (contrato == null) return NotFound(new { mensaje = "Contrato no encontrado." });
        contrato.TipoContrato = datos.TipoContrato;
        contrato.FechaInicio = datos.FechaInicio;
        contrato.FechaFin = datos.FechaFin;
        await _db.SaveChangesAsync();
        return Ok(new { mensaje = "Contrato actualizado." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var contrato = await _db.Contratos.FirstOrDefaultAsync(c => c.Id == id && c.Estado == "Activo");
        if (contrato == null) return NotFound(new { mensaje = "Contrato no encontrado." });
        contrato.Estado = "Inactivo";
        await _db.SaveChangesAsync();
        return Ok(new { mensaje = "Contrato desactivado." });
    }
}