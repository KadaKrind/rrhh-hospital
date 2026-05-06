const API_ASIGNACIONES = 'http://localhost:5205/api/asignaciones';
const API_EMPLEADOS_AS = 'http://localhost:5205/api/empleados';
const API_TURNOS_AS = 'http://localhost:5205/api/turnos';
const API_DEPTOS_AS = 'http://localhost:5205/api/departamentos';

async function loadAsignaciones() {
    const [asignaciones, empleados, turnos, deptos] = await Promise.all([
        fetch(API_ASIGNACIONES).then(r => r.json()).catch(() => []),
        fetch(API_EMPLEADOS_AS).then(r => r.json()).catch(() => []),
        fetch(API_TURNOS_AS).then(r => r.json()).catch(() => []),
        fetch(API_DEPTOS_AS).then(r => r.json()).catch(() => [])
    ]);

    const empleadoMap = {};
    empleados.forEach((e, i) => { empleadoMap[i + 1] = `${e.nombre} ${e.apellido}`; });
    const turnoMap = {};
    turnos.forEach((t, i) => { turnoMap[i + 1] = t.descripcion; });
    const deptoMap = {};
    deptos.forEach((d, i) => { deptoMap[i + 1] = d.nombre; });

    const container = document.getElementById('page-asignaciones');
    container.innerHTML = `
    <div class="page-header-actions">
      <button class="btn btn-primary" onclick="abrirModalNuevaAsignacion(
        ${JSON.stringify(empleados).replace(/"/g, '&quot;')},
        ${JSON.stringify(turnos).replace(/"/g, '&quot;')},
        ${JSON.stringify(deptos).replace(/"/g, '&quot;')}
      )">+ Nueva Asignación</button>
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
            <th>Fecha Fin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${asignaciones.length === 0
            ? `<tr><td colspan="7" class="empty-row">No hay asignaciones registradas</td></tr>`
            : asignaciones.map(a => `
              <tr>
                <td>${a.codigoAsignacion}</td>
                <td>${empleadoMap[a.empleadoId] || 'Desconocido'}</td>
                <td>${turnoMap[a.turnoId] || '-'}</td>
                <td>${deptoMap[a.departamentoId] || '-'}</td>
                <td>${a.fechaInicio ? a.fechaInicio.split('T')[0] : '-'}</td>
                <td>${a.fechaFin ? a.fechaFin.split('T')[0] : 'Vigente'}</td>
                <td>
                  <button class="btn btn-sm btn-secondary" onclick="abrirModalEditarAsignacion(
                    '${a.codigoAsignacion}',
                    ${JSON.stringify(empleados).replace(/"/g, '&quot;')},
                    ${JSON.stringify(turnos).replace(/"/g, '&quot;')},
                    ${JSON.stringify(deptos).replace(/"/g, '&quot;')}
                  )">Editar</button>
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

async function abrirModalNuevaAsignacion(empleados, turnos, deptos) {
    const codigo = await generarSiguienteCodigo(API_ASIGNACIONES, 'codigoAsignacion', 'ASG');
    const optsEmp = empleados.map((e, i) => `<option value="${i + 1}">${e.nombre} ${e.apellido}</option>`).join('');
    const optsTur = turnos.map((t, i) => `<option value="${i + 1}">${t.descripcion}</option>`).join('');
    const optsDep = deptos.map((d, i) => `<option value="${i + 1}">${d.nombre}</option>`).join('');

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
    else alert('Error al guardar la asignación');
}

async function abrirModalEditarAsignacion(codigo, empleados, turnos, deptos) {
    const a = await fetch(`${API_ASIGNACIONES}/${codigo}`).then(r => r.json());
    const optsEmp = empleados.map((e, i) => `<option value="${i + 1}" ${(i + 1) === a.empleadoId ? 'selected' : ''}>${e.nombre} ${e.apellido}</option>`).join('');
    const optsTur = turnos.map((t, i) => `<option value="${i + 1}" ${(i + 1) === a.turnoId ? 'selected' : ''}>${t.descripcion}</option>`).join('');
    const optsDep = deptos.map((d, i) => `<option value="${i + 1}" ${(i + 1) === a.departamentoId ? 'selected' : ''}>${d.nombre}</option>`).join('');

    openModal(`
    <h2>Editar Asignación</h2>
    <form onsubmit="actualizarAsignacion(event, '${codigo}')">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoAsignacion" value="${a.codigoAsignacion}" readonly
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
        <input type="date" name="fechaInicio" value="${a.fechaInicio ? a.fechaInicio.split('T')[0] : ''}" required />
      </div>
      <div class="form-group">
        <label>Fecha Fin <small>(opcional)</small></label>
        <input type="date" name="fechaFin" value="${a.fechaFin ? a.fechaFin.split('T')[0] : ''}" />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Actualizar</button>
      </div>
    </form>
  `);
}

async function actualizarAsignacion(e, codigo) {
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
    const res = await fetch(`${API_ASIGNACIONES}/${codigo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { closeModal(); paginasCargadas.delete('asignaciones'); loadAsignaciones(); }
    else alert('Error al actualizar la asignación');
}

async function eliminarAsignacion(codigo) {
    if (!confirm('¿Eliminar esta asignación?')) return;
    const res = await fetch(`${API_ASIGNACIONES}/${codigo}`, { method: 'DELETE' });
    if (res.ok) { paginasCargadas.delete('asignaciones'); loadAsignaciones(); }
    else alert('Error al eliminar la asignación');
}