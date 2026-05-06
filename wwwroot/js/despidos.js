const API_DESPIDOS = 'http://localhost:5205/api/despidos';

async function loadDespidos() {
    const despidos = await fetch(API_DESPIDOS).then(r => r.json()).catch(() => []);

    const container = document.getElementById('page-despidos');
    container.innerHTML = `
    <div class="page-header-actions">
      <button class="btn btn-primary" onclick="abrirModalNuevoDespido()">+ Registrar Despido</button>
    </div>
    <div class="table-wrapper">
      <table class="data-table" id="tabla-despidos">
        <thead>
          <tr>
            <th>Código</th>
            <th>Empleado</th>
            <th>Fecha</th>
            <th>Motivo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${despidos.length === 0
            ? `<tr><td colspan="5" class="empty-row">No hay despidos registrados</td></tr>`
            : despidos.map(d => `
              <tr>
                <td>${d.codigoDespido || d.id}</td>
                <td>${d.empleado || '-'}</td>
                <td>${d.fecha ? d.fecha.split('T')[0] : '-'}</td>
                <td>${d.motivo || '-'}</td>
                <td>
                  <button class="btn btn-sm btn-secondary" onclick='abrirModalEditarDespido(${JSON.stringify(d)})'>Editar</button>
                  <button class="btn btn-sm btn-danger" onclick="eliminarDespido(${d.id})">Eliminar</button>
                </td>
              </tr>
            `).join('')
        }
        </tbody>
      </table>
    </div>
  `;
    makeTableSortable('tabla-despidos');
}

async function abrirModalNuevoDespido() {
    const codigo = await generarSiguienteCodigo(API_DESPIDOS, 'codigoDespido', 'DES');

    openModal(`
    <h2>Registrar Despido</h2>
    <form onsubmit="guardarDespido(event)">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoDespido" value="${codigo}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Empleado (nombre completo)</label>
        <input type="text" name="empleado" placeholder="Ej: Juan Perez" required />
      </div>
      <div class="form-group">
        <label>Fecha</label>
        <input type="date" name="fecha" required />
      </div>
      <div class="form-group">
        <label>Motivo</label>
        <textarea name="motivo" rows="3" placeholder="Descripción del motivo..." required></textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar</button>
      </div>
    </form>
  `);
}

async function guardarDespido(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        codigoDespido: form.codigoDespido.value,
        empleado: form.empleado.value,
        fecha: form.fecha.value,
        motivo: form.motivo.value
    };
    const res = await fetch(API_DESPIDOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { closeModal(); paginasCargadas.delete('despidos'); loadDespidos(); }
    else alert('Error al guardar el despido');
}

function abrirModalEditarDespido(d) {
    openModal(`
    <h2>Editar Despido</h2>
    <form onsubmit="actualizarDespido(event, ${d.id})">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoDespido" value="${d.codigoDespido || d.id}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Empleado</label>
        <input type="text" name="empleado" value="${d.empleado || ''}" required />
      </div>
      <div class="form-group">
        <label>Fecha</label>
        <input type="date" name="fecha" value="${d.fecha ? d.fecha.split('T')[0] : ''}" required />
      </div>
      <div class="form-group">
        <label>Motivo</label>
        <textarea name="motivo" rows="3" required>${d.motivo || ''}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Actualizar</button>
      </div>
    </form>
  `);
}

async function actualizarDespido(e, id) {
    e.preventDefault();
    const form = e.target;
    const data = {
        id,
        codigoDespido: form.codigoDespido.value,
        empleado: form.empleado.value,
        fecha: form.fecha.value,
        motivo: form.motivo.value
    };
    const res = await fetch(`${API_DESPIDOS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { closeModal(); paginasCargadas.delete('despidos'); loadDespidos(); }
    else alert('Error al actualizar el despido');
}

async function eliminarDespido(id) {
    if (!confirm('¿Eliminar este registro?')) return;
    const res = await fetch(`${API_DESPIDOS}/${id}`, { method: 'DELETE' });
    if (res.ok) { paginasCargadas.delete('despidos'); loadDespidos(); }
    else alert('Error al eliminar el despido');
}