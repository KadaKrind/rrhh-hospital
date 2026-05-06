using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MicroservicioRRHH.Data;
using MicroservicioRRHH.Models;

namespace MicroservicioRRHH.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartamentosController : ControllerBase
{
    private readonly AppDbContext _db;
    public DepartamentosController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var departamentos = await _db.Departamentos
            .Where(d => d.Estado == "Activo")
            .Select(d => new {
                d.Id,
                d.CodigoDepartamento,
                d.Nombre
            }).ToListAsync();
        return Ok(departamentos);
    }

    [HttpGet("{codigo}")]
    public async Task<IActionResult> GetByCodigo(string codigo)
    {
        var dep = await _db.Departamentos
            .Where(d => d.CodigoDepartamento == codigo && d.Estado == "Activo")
            .Select(d => new {
                d.CodigoDepartamento,
                d.Nombre
            }).FirstOrDefaultAsync();

        if (dep == null) return NotFound(new { mensaje = "Departamento no encontrado." });
        return Ok(dep);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Departamento departamento)
    {
        bool existe = await _db.Departamentos.AnyAsync(d => d.CodigoDepartamento == departamento.CodigoDepartamento);
        if (existe) return Conflict(new { mensaje = "Ya existe un departamento con ese código." });

        departamento.Estado = "Activo";
        _db.Departamentos.Add(departamento);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetByCodigo), new { codigo = departamento.CodigoDepartamento },
            new { departamento.CodigoDepartamento, departamento.Nombre });
    }

    [HttpPut("{codigo}")]
    public async Task<IActionResult> Update(string codigo, [FromBody] Departamento datos)
    {
        var dep = await _db.Departamentos.FirstOrDefaultAsync(d => d.CodigoDepartamento == codigo && d.Estado == "Activo");
        if (dep == null) return NotFound(new { mensaje = "Departamento no encontrado." });

        dep.Nombre = datos.Nombre;

        await _db.SaveChangesAsync();
        return Ok(new { mensaje = "Departamento actualizado correctamente." });
    }

    [HttpDelete("{codigo}")]
    public async Task<IActionResult> Delete(string codigo)
    {
        var dep = await _db.Departamentos.FirstOrDefaultAsync(d => d.CodigoDepartamento == codigo && d.Estado == "Activo");
        if (dep == null) return NotFound(new { mensaje = "Departamento no encontrado." });

        dep.Estado = "Inactivo";
        await _db.SaveChangesAsync();
        return Ok(new { mensaje = "Departamento desactivado correctamente." });
    }
}