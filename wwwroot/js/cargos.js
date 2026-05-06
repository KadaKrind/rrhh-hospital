const API_CARGOS = 'http://localhost:5205/api/cargos';

async function loadCargos() {
    const cargos = await fetch(API_CARGOS).then(r => r.json()).catch(() => []);

    const container = document.getElementById('page-cargos');
    container.innerHTML = `
    <div class="page-header-actions">
      <button class="btn btn-primary" onclick="abrirModalNuevoCargo()">+ Nuevo Cargo</button>
    </div>
    <div class="table-wrapper">
      <table class="data-table" id="tabla-cargos">
        <thead>
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${cargos.length === 0
            ? `<tr><td colspan="5" class="empty-row">No hay cargos registrados</td></tr>`
            : cargos.map(c => `
              <tr>
                <td>${c.id}</td>
                <td>${c.codigoCargo || '-'}</td>
                <td>${c.nombre}</td>
                <td>${c.descripcion || '-'}</td>
                <td>
                  <button class="btn btn-sm btn-secondary" onclick='abrirModalEditarCargo(${JSON.stringify(c)})'>Editar</button>
                  <button class="btn btn-sm btn-danger" onclick="eliminarCargo(${c.id})">Eliminar</button>
                </td>
              </tr>
            `).join('')
        }
        </tbody>
      </table>
    </div>
  `;
    makeTableSortable('tabla-cargos');
}

async function abrirModalNuevoCargo() {
    const codigo = await generarSiguienteCodigo(API_CARGOS, 'codigoCargo', 'CAR');

    openModal(`
    <h2>Nuevo Cargo</h2>
    <form onsubmit="guardarCargo(event)">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoCargo" value="${codigo}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Nombre</label>
        <input type="text" name="nombre" placeholder="Ej: Enfermero" required />
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <textarea name="descripcion" rows="3" placeholder="Descripción del cargo..."></textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar</button>
      </div>
    </form>
  `);
}

async function guardarCargo(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        codigoCargo: form.codigoCargo.value,
        nombre: form.nombre.value,
        descripcion: form.descripcion.value
    };
    const res = await fetch(API_CARGOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { closeModal(); paginasCargadas.delete('cargos'); loadCargos(); }
    else alert('Error al guardar el cargo');
}

function abrirModalEditarCargo(c) {
    openModal(`
    <h2>Editar Cargo</h2>
    <form onsubmit="actualizarCargo(event, ${c.id})">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoCargo" value="${c.codigoCargo || ''}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Nombre</label>
        <input type="text" name="nombre" value="${c.nombre || ''}" required />
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <textarea name="descripcion" rows="3">${c.descripcion || ''}</textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Actualizar</button>
      </div>
    </form>
  `);
}

async function actualizarCargo(e, id) {
    e.preventDefault();
    const form = e.target;
    const data = {
        id,
        codigoCargo: form.codigoCargo.value,
        nombre: form.nombre.value,
        descripcion: form.descripcion.value
    };
    const res = await fetch(`${API_CARGOS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { closeModal(); paginasCargadas.delete('cargos'); loadCargos(); }
    else alert('Error al actualizar el cargo');
}

async function eliminarCargo(id) {
    if (!confirm('¿Eliminar este cargo?')) return;
    const res = await fetch(`${API_CARGOS}/${id}`, { method: 'DELETE' });
    if (res.ok) { paginasCargadas.delete('cargos'); loadCargos(); }
    else alert('Error al eliminar el cargo');
}