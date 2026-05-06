const API_DEPARTAMENTOS = 'https://rrhh-hospital-production.up.railway.app/api/departamentos';

async function loadDepartamentos() {
    const departamentos = await fetch(API_DEPARTAMENTOS).then(r => r.json()).catch(() => []);

    const container = document.getElementById('page-departamentos');
    container.innerHTML = `
    <div class="page-header-actions">
      <button class="btn btn-primary" onclick="abrirModalNuevoDepartamento()">+ Nuevo Departamento</button>
    </div>
    <div class="table-wrapper">
      <table class="data-table" id="tabla-departamentos">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${departamentos.length === 0
            ? `<tr><td colspan="3" class="empty-row">No hay departamentos registrados</td></tr>`
            : departamentos.map(d => `
              <tr>
                <td>${d.codigoDepartamento}</td>
                <td>${d.nombre}</td>
                <td>
                  <button class="btn btn-sm btn-secondary" onclick="abrirModalEditarDepartamento('${d.codigoDepartamento}')">Editar</button>
                  <button class="btn btn-sm btn-danger" onclick="eliminarDepartamento('${d.codigoDepartamento}')">Eliminar</button>
                </td>
              </tr>
            `).join('')
        }
        </tbody>
      </table>
    </div>
  `;
    makeTableSortable('tabla-departamentos');
}

async function abrirModalNuevoDepartamento() {
    const codigo = await generarSiguienteCodigo(API_DEPARTAMENTOS, 'codigoDepartamento', 'DEP');

    openModal(`
    <h2>Nuevo Departamento</h2>
    <form onsubmit="guardarDepartamento(event)">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoDepartamento" value="${codigo}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Nombre</label>
        <input type="text" name="nombre" placeholder="Ej: Urgencias" required />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar</button>
      </div>
    </form>
  `);
}

async function guardarDepartamento(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        codigoDepartamento: form.codigoDepartamento.value,
        nombre: form.nombre.value
    };
    const res = await fetch(API_DEPARTAMENTOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { closeModal(); paginasCargadas.delete('departamentos'); loadDepartamentos(); }
    else alert('Error al guardar el departamento');
}

async function abrirModalEditarDepartamento(codigo) {
    const dep = await fetch(`${API_DEPARTAMENTOS}/${codigo}`).then(r => r.json());
    openModal(`
    <h2>Editar Departamento</h2>
    <form onsubmit="actualizarDepartamento(event, '${codigo}')">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoDepartamento" value="${dep.codigoDepartamento}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Nombre</label>
        <input type="text" name="nombre" value="${dep.nombre}" required />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Actualizar</button>
      </div>
    </form>
  `);
}

async function actualizarDepartamento(e, codigo) {
    e.preventDefault();
    const form = e.target;
    const data = {
        codigoDepartamento: form.codigoDepartamento.value,
        nombre: form.nombre.value
    };
    const res = await fetch(`${API_DEPARTAMENTOS}/${codigo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { closeModal(); paginasCargadas.delete('departamentos'); loadDepartamentos(); }
    else alert('Error al actualizar el departamento');
}

async function eliminarDepartamento(codigo) {
    if (!confirm('¿Eliminar este departamento?')) return;
    const res = await fetch(`${API_DEPARTAMENTOS}/${codigo}`, { method: 'DELETE' });
    if (res.ok) { paginasCargadas.delete('departamentos'); loadDepartamentos(); }
    else alert('Error al eliminar el departamento');
}