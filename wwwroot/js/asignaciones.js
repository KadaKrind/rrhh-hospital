const API_ASIGNACIONES = 'https://rrhh-hospital-production.up.railway.app/api/asignaciones';
const API_EMPLEADOS_AS = 'https://rrhh-hospital-production.up.railway.app/api/empleados';
const API_TURNOS_AS = 'https://rrhh-hospital-production.up.railway.app/api/turnos';
const API_DEPTOS_AS = 'https://rrhh-hospital-production.up.railway.app/api/departamentos';

async function loadAsignaciones() {
    const [asignaciones, empleados, turnos, deptos] = await Promise.all([
        fetch(`${API_ASIGNACIONES}/join/detalle-completo`).then(r => r.json()).catch(() => []),
        fetch(API_EMPLEADOS_AS).then(r => r.json()).catch(() => []),
        fetch(API_TURNOS_AS).then(r => r.json()).catch(() => []),
        fetch(API_DEPTOS_AS).then(r => r.json()).catch(() => [])
    ]);

    const container = document.getElementById('page-asignaciones');
    container.innerHTML = `
    <div class="page-header-actions">
      <button class="btn btn-primary" onclick="abrirModalNuevaAsignacion()">+ Nueva Asignación</button>
    </div>
    <div class="table-wrapper">
      <table class="data-table" id="tabla-asignaciones">
        <thead>
          <tr>
            <th>Código</th>
            <th>Empleado</th>
            <th>Turno</th>
            <th>Departamento</th>
            <th>Fecha Inicio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${asignaciones.length === 0
            ? `<tr><td colspan="6" class="empty-row">No hay asignaciones registradas</td></tr>`
            : asignaciones.map(a => `
              <tr>
                <td>${a.codigoAsignacion}</td>
                <td>${a.empleado}</td>
                <td>${a.turno || '-'}</td>
                <td>${a.departamento || '-'}</td>
                <td>${a.fechaInicio ? a.fechaInicio.split('T')[0] : '-'}</td>
                <td>
                  <button class="btn btn-sm btn-danger" onclick="eliminarAsignacion('${a.codigoAsignacion}')">Eliminar</button>
                </td>
              </tr>
            `).join('')
        }
        </tbody>
      </table>
    </div>
  `;
    makeTableSortable('tabla-asignaciones');
}

async function abrirModalNuevaAsignacion() {
    const [codigo, empleados, turnos, deptos] = await Promise.all([
        generarSiguienteCodigo(API_ASIGNACIONES, 'codigoAsignacion', 'ASG'),
        fetch(API_EMPLEADOS_AS).then(r => r.json()).catch(() => []),
        fetch(API_TURNOS_AS).then(r => r.json()).catch(() => []),
        fetch(API_DEPTOS_AS).then(r => r.json()).catch(() => [])
    ]);

    const optsEmp = empleados.map(e => `<option value="${e.id}">${e.nombre} ${e.apellido}</option>`).join('');
    const optsTur = turnos.map(t => `<option value="${t.id}">${t.descripcion}</option>`).join('');
    const optsDep = deptos.map(d => `<option value="${d.id}">${d.nombre}</option>`).join('');

    openModal(`
    <h2>Nueva Asignación</h2>
    <form onsubmit="guardarAsignacion(event)">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoAsignacion" value="${codigo}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Empleado</label>
        <select name="empleadoId" required>
          <option value="">-- Seleccionar --</option>${optsEmp}
        </select>
      </div>
      <div class="form-group">
        <label>Turno</label>
        <select name="turnoId" required>
          <option value="">-- Seleccionar --</option>${optsTur}
        </select>
      </div>
      <div class="form-group">
        <label>Departamento</label>
        <select name="departamentoId" required>
          <option value="">-- Seleccionar --</option>${optsDep}
        </select>
      </div>
      <div class="form-group">
        <label>Fecha Inicio</label>
        <input type="date" name="fechaInicio" required />
      </div>
      <div class="form-group">
        <label>Fecha Fin <small>(opcional)</small></label>
        <input type="date" name="fechaFin" />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar</button>
      </div>
    </form>
  `);
}

async function guardarAsignacion(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        codigoAsignacion: form.codigoAsignacion.value,
        empleadoId: parseInt(form.empleadoId.value),
        turnoId: parseInt(form.turnoId.value),
        departamentoId: parseInt(form.departamentoId.value),
        fechaInicio: form.fechaInicio.value,
        fechaFin: form.fechaFin.value || null
    };
    const res = await fetch(API_ASIGNACIONES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { closeModal(); paginasCargadas.delete('asignaciones'); loadAsignaciones(); }
    else {
        const err = await res.json().catch(() => ({}));
        alert('Error: ' + (err.mensaje || 'No se pudo guardar la asignación'));
    }
}

async function eliminarAsignacion(codigo) {
    if (!confirm('¿Eliminar esta asignación?')) return;
    const res = await fetch(`${API_ASIGNACIONES}/${codigo}`, { method: 'DELETE' });
    if (res.ok) { paginasCargadas.delete('asignaciones'); loadAsignaciones(); }
    else alert('Error al eliminar la asignación');
}