using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MicroservicioRRHH.Data;
using MicroservicioRRHH.Models;

namespace MicroservicioRRHH.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CargosController : ControllerBase
{
    private readonly AppDbContext _db;
    public CargosController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var lista = await (from c in _db.Cargos
                           where c.Estado == "Activo"
                           select new { c.Id, c.CodigoCargo, c.Nombre, c.Descripcion })
                          .ToListAsync();
        return Ok(lista);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var cargo = await (from c in _db.Cargos
                           where c.Id == id && c.Estado == "Activo"
                           select new { c.Id, c.CodigoCargo, c.Nombre, c.Descripcion })
                          .FirstOrDefaultAsync();
        if (cargo == null) return NotFound(new { mensaje = "Cargo no encontrado." });
        return Ok(cargo);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Cargo cargo)
    {
        bool existe = await _db.Cargos.AnyAsync(c => c.CodigoCargo == cargo.CodigoCargo);
        if (existe) return Conflict(new { mensaje = "Ya existe un cargo con ese código." });
        cargo.Estado = "Activo";
        _db.Cargos.Add(cargo);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = cargo.Id }, cargo);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Cargo datos)
    {
        var cargo = await _db.Cargos.FirstOrDefaultAsync(c => c.Id == id && c.Estado == "Activo");
        if (cargo == null) return NotFound(new { mensaje = "Cargo no encontrado." });
        cargo.Nombre = datos.Nombre;
        cargo.Descripcion = datos.Descripcion;
        await _db.SaveChangesAsync();
        return Ok(new { mensaje = "Cargo actualizado." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var cargo = await _db.Cargos.FirstOrDefaultAsync(c => c.Id == id && c.Estado == "Activo");
        if (cargo == null) return NotFound(new { mensaje = "Cargo no encontrado." });
        cargo.Estado = "Inactivo";
        await _db.SaveChangesAsync();
        return Ok(new { mensaje = "Cargo desactivado." });
    }
}