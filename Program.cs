using Microsoft.EntityFrameworkCore;
using MicroservicioRRHH.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS para que el frontend pueda llamar a la API
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();                // <- CORS
app.UseDefaultFiles();        // <- busca index.html en wwwroot
app.UseStaticFiles();         // <- sirve archivos de wwwroot
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();