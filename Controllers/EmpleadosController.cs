using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MicroservicioRRHH.Data;
using MicroservicioRRHH.Models;

namespace MicroservicioRRHH.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmpleadosController : ControllerBase
{
    private readonly AppDbContext _db;
    public EmpleadosController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var empleados = await _db.Empleados
            .Where(e => e.Estado == "Activo")
            .Select(e => new {
                e.CodigoEmpleado,
                e.Ci,
                e.Nombre,
                e.Apellido,
                e.FechaContratacion,
                e.SalarioBase
            }).ToListAsync();
        return Ok(empleados);
    }

    [HttpGet("{codigo}")]
    public async Task<IActionResult> GetByCodigo(string codigo)
    {
        var emp = await _db.Empleados
            .Where(e => e.CodigoEmpleado == codigo && e.Estado == "Activo")
            .Select(e => new {
                e.CodigoEmpleado,
                e.Ci,
                e.Nombre,
                e.Apellido,
                e.FechaContratacion,
                e.SalarioBase
            }).FirstOrDefaultAsync();

        if (emp == null) return NotFound(new { mensaje = "Empleado no encontrado." });
        return Ok(emp);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Empleado empleado)
    {
        bool existe = await _db.Empleados.AnyAsync(e => e.CodigoEmpleado == empleado.CodigoEmpleado);
        if (existe) return Conflict(new { mensaje = "Ya existe un empleado con ese código." });

        // Fix DateTime UTC para PostgreSQL
        empleado.FechaIngreso = DateTime.SpecifyKind(empleado.FechaIngreso, DateTimeKind.Utc);
        empleado.FechaContratacion = DateTime.SpecifyKind(empleado.FechaContratacion, DateTimeKind.Utc);

        empleado.Estado = "Activo";
        _db.Empleados.Add(empleado);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByCodigo), new { codigo = empleado.CodigoEmpleado },
            new { empleado.CodigoEmpleado, empleado.Nombre, empleado.Apellido });
    }

    [HttpPut("{codigo}")]
    public async Task<IActionResult> Update(string codigo, [FromBody] Empleado datos)
    {
        var emp = await _db.Empleados.FirstOrDefaultAsync(e => e.CodigoEmpleado == codigo && e.Estado == "Activo");
        if (emp == null) return NotFound(new { mensaje = "Empleado no encontrado." });

        emp.Ci = datos.Ci;
        emp.Nombre = datos.Nombre;
        emp.Apellido = datos.Apellido;
        // Fix DateTime UTC para PostgreSQL
        emp.FechaContratacion = DateTime.SpecifyKind(datos.FechaContratacion, DateTimeKind.Utc);
        emp.SalarioBase = datos.SalarioBase;

        await _db.SaveChangesAsync();
        return Ok(new { mensaje = "Empleado actualizado correctamente." });
    }

    [HttpDelete("{codigo}")]
    public async Task<IActionResult> Delete(string codigo)
    {
        var emp = await _db.Empleados.FirstOrDefaultAsync(e => e.CodigoEmpleado == codigo && e.Estado == "Activo");
        if (emp == null) return NotFound(new { mensaje = "Empleado no encontrado." });

        emp.Estado = "Inactivo";
        await _db.SaveChangesAsync();
        return Ok(new { mensaje = "Empleado desactivado correctamente." });
    }
}