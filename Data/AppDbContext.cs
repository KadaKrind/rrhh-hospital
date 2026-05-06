using MicroservicioRRHH.Models;
using Microsoft.EntityFrameworkCore;

namespace MicroservicioRRHH.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Empleado> Empleados => Set<Empleado>();
    public DbSet<Turno> Turnos => Set<Turno>();
    public DbSet<Departamento> Departamentos => Set<Departamento>();
    public DbSet<EmpleadoTurnoDepartamento> EmpleadoTurnoDepartamentos => Set<EmpleadoTurnoDepartamento>();
    public DbSet<Cargo> Cargos => Set<Cargo>();
    public DbSet<Contrato> Contratos => Set<Contrato>();
    public DbSet<Planilla> Planillas => Set<Planilla>();
    public DbSet<Despido> Despidos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Empleado>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.CodigoEmpleado).IsUnique();
            e.HasOne(x => x.Cargo)
             .WithMany()
             .HasForeignKey(x => x.CargoId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Turno>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.CodigoTurno).IsUnique();
        });

        modelBuilder.Entity<Departamento>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.CodigoDepartamento).IsUnique();
        });

        modelBuilder.Entity<Cargo>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.CodigoCargo).IsUnique();
        });

        modelBuilder.Entity<Contrato>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.CodigoContrato).IsUnique();
            e.HasOne(x => x.Empleado)
             .WithMany()
             .HasForeignKey(x => x.EmpleadoId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Planilla>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.CodigoPlanilla).IsUnique();
            e.Property(x => x.SueldoBase).HasPrecision(18, 2);
            e.Property(x => x.Descuentos).HasPrecision(18, 2);
            e.Property(x => x.SueldoNeto).HasPrecision(18, 2);
            e.HasOne(x => x.Empleado)
             .WithMany()
             .HasForeignKey(x => x.EmpleadoId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Cargo)
             .WithMany()
             .HasForeignKey(x => x.CargoId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<EmpleadoTurnoDepartamento>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.CodigoAsignacion).IsUnique();

            e.HasOne(x => x.Empleado)
             .WithMany(x => x.Asignaciones)
             .HasForeignKey(x => x.EmpleadoId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Turno)
             .WithMany(x => x.Asignaciones)
             .HasForeignKey(x => x.TurnoId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Departamento)
             .WithMany(x => x.Asignaciones)
             .HasForeignKey(x => x.DepartamentoId)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}