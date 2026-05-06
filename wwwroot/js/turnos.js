const API_TURNOS = 'http://localhost:5205/api/turnos';

async function loadTurnos() {
    const turnos = await fetch(API_TURNOS).then(r => r.json()).catch(() => []);

    const container = document.getElementById('page-turnos');
    container.innerHTML = `
    <div class="page-header-actions">
      <button class="btn btn-primary" onclick="abrirModalNuevoTurno()">+ Nuevo Turno</button>
    </div>
    <div class="table-wrapper">
      <table class="data-table" id="tabla-turnos">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción</th>
            <th>Hora Inicio</th>
            <th>Hora Fin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${turnos.length === 0
            ? `<tr><td colspan="5" class="empty-row">No hay turnos registrados</td></tr>`
            : turnos.map(t => `
              <tr>
                <td>${t.codigoTurno}</td>
                <td>${t.descripcion}</td>
                <td>${t.horaInicio || '-'}</td>
                <td>${t.horaFin || '-'}</td>
                <td>
                  <button class="btn btn-sm btn-secondary" onclick='abrirModalEditarTurno(${JSON.stringify(t)})'>Editar</button>
                  <button class="btn btn-sm btn-danger" onclick="eliminarTurno('${t.codigoTurno}')">Eliminar</button>
                </td>
              </tr>
            `).join('')
        }
        </tbody>
      </table>
    </div>
  `;

    makeTableSortable('tabla-turnos');
}

async function abrirModalNuevoTurno() {
    const codigo = await generarSiguienteCodigo(API_TURNOS, 'codigoTurno', 'TUR');

    openModal(`
    <h2>Nuevo Turno</h2>
    <form onsubmit="guardarTurno(event)">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoTurno" value="${codigo}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <input type="text" name="descripcion" placeholder="Ej: Turno Mañana" required />
      </div>
      <div class="form-group">
        <label>Hora Inicio</label>
        <input type="time" name="horaInicio" required />
      </div>
      <div class="form-group">
        <label>Hora Fin</label>
        <input type="time" name="horaFin" required />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar</button>
      </div>
    </form>
  `);
}

async function guardarTurno(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        codigoTurno: form.codigoTurno.value,
        descripcion: form.descripcion.value,
        horaInicio: form.horaInicio.value,
        horaFin: form.horaFin.value
    };
    const res = await fetch(API_TURNOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { closeModal(); paginasCargadas.delete('turnos'); loadTurnos(); }
    else alert('Error al guardar el turno');
}

function abrirModalEditarTurno(t) {
    openModal(`
    <h2>Editar Turno</h2>
    <form onsubmit="actualizarTurno(event, '${t.codigoTurno}')">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoTurno" value="${t.codigoTurno}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <input type="text" name="descripcion" value="${t.descripcion}" required />
      </div>
      <div class="form-group">
        <label>Hora Inicio</label>
        <input type="time" name="horaInicio" value="${t.horaInicio || ''}" required />
      </div>
      <div class="form-group">
        <label>Hora Fin</label>
        <input type="time" name="horaFin" value="${t.horaFin || ''}" required />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Actualizar</button>
      </div>
    </form>
  `);
}

async function actualizarTurno(e, codigo) {
    e.preventDefault();
    const form = e.target;
    const data = {
        codigoTurno: form.codigoTurno.value,
        descripcion: form.descripcion.value,
        horaInicio: form.horaInicio.value,
        horaFin: form.horaFin.value
    };
    const res = await fetch(`${API_TURNOS}/${codigo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { closeModal(); paginasCargadas.delete('turnos'); loadTurnos(); }
    else alert('Error al actualizar el turno');
}

async function eliminarTurno(codigo) {
    if (!confirm('¿Eliminar este turno?')) return;
    const res = await fetch(`${API_TURNOS}/${codigo}`, { method: 'DELETE' });
    if (res.ok) { paginasCargadas.delete('turnos'); loadTurnos(); }
    else alert('Error al eliminar el turno');
}