const API_CONTRATOS = 'https://rrhh-hospital-production.up.railway.app/api/contratos';
const API_EMPLEADOS_CON = 'https://rrhh-hospital-production.up.railway.app/api/empleados';

async function loadContratos() {
    const contratos = await fetch(API_CONTRATOS).then(r => r.json()).catch(() => []);

    const container = document.getElementById('page-contratos');
    container.innerHTML = `
    <div class="page-header-actions">
      <button class="btn btn-primary" onclick="abrirModalNuevoContrato()">+ Nuevo Contrato</button>
    </div>
    <div class="table-wrapper">
      <table class="data-table" id="tabla-contratos">
        <thead>
          <tr>
            <th>Código</th>
            <th>Empleado</th>
            <th>Tipo</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${contratos.length === 0
            ? `<tr><td colspan="6" class="empty-row">No hay contratos registrados</td></tr>`
            : contratos.map(c => `
              <tr>
                <td>${c.codigoContrato}</td>
                <td>${c.empleado || '-'}</td>
                <td>${c.tipoContrato || '-'}</td>
                <td>${c.fechaInicio ? c.fechaInicio.split('T')[0] : '-'}</td>
                <td>${c.fechaFin ? c.fechaFin.split('T')[0] : 'Vigente'}</td>
                <td>
                  <button class="btn btn-sm btn-secondary" onclick="abrirModalEditarContrato(${c.id})">Editar</button>
                  <button class="btn btn-sm btn-danger" onclick="eliminarContrato(${c.id})">Eliminar</button>
                </td>
              </tr>
            `).join('')
        }
        </tbody>
      </table>
    </div>
  `;
    makeTableSortable('tabla-contratos');
}

async function abrirModalNuevoContrato() {
    const [codigo, empleados] = await Promise.all([
        generarSiguienteCodigo(API_CONTRATOS, 'codigoContrato', 'CON'),
        fetch(API_EMPLEADOS_CON).then(r => r.json()).catch(() => [])
    ]);

    const optsEmp = empleados.map(e => `<option value="${e.id}">${e.nombre} ${e.apellido}</option>`).join('');

    openModal(`
    <h2>Nuevo Contrato</h2>
    <form onsubmit="guardarContrato(event)">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoContrato" value="${codigo}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Empleado</label>
        <select name="empleadoId" required>
          <option value="">-- Seleccionar --</option>${optsEmp}
        </select>
      </div>
      <div class="form-group">
        <label>Tipo de Contrato</label>
        <select name="tipoContrato" required>
          <option value="">-- Seleccionar --</option>
          <option value="Indefinido">Indefinido</option>
          <option value="Temporal">Temporal</option>
          <option value="Por Obra">Por Obra</option>
          <option value="Item">Item</option>
          <option value="Eventual">Eventual</option>
          <option value="Consultoría">Consultoría</option>
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

async function guardarContrato(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        codigoContrato: form.codigoContrato.value,
        empleadoId: parseInt(form.empleadoId.value),
        tipoContrato: form.tipoContrato.value,
        fechaInicio: form.fechaInicio.value,
        fechaFin: form.fechaFin.value || null
    };
    const res = await fetch(API_CONTRATOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { closeModal(); paginasCargadas.delete('contratos'); loadContratos(); }
    else {
        const err = await res.json().catch(() => ({}));
        alert('Error: ' + (err.mensaje || 'No se pudo guardar el contrato'));
    }
}

async function abrirModalEditarContrato(id) {
    const [c, empleados] = await Promise.all([
        fetch(`${API_CONTRATOS}/${id}`).then(r => r.json()),
        fetch(API_EMPLEADOS_CON).then(r => r.json()).catch(() => [])
    ]);

    const optsEmp = empleados.map(e => `<option value="${e.id}" ${e.id === c.empleadoId ? 'selected' : ''}>${e.nombre} ${e.apellido}</option>`).join('');
    const tipos = ['Indefinido', 'Temporal', 'Por Obra', 'Item', 'Eventual', 'Consultoría'];
    const optsTipo = tipos.map(t => `<option value="${t}" ${c.tipoContrato === t ? 'selected' : ''}>${t}</option>`).join('');

    openModal(`
    <h2>Editar Contrato</h2>
    <form onsubmit="actualizarContrato(event, ${id})">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoContrato" value="${c.codigoContrato}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Empleado</label>
        <select name="empleadoId" required>
          <option value="">-- Seleccionar --</option>${optsEmp}
        </select>
      </div>
      <div class="form-group">
        <label>Tipo de Contrato</label>
        <select name="tipoContrato" required>${optsTipo}</select>
      </div>
      <div class="form-group">
        <label>Fecha Inicio</label>
        <input type="date" name="fechaInicio" value="${c.fechaInicio ? c.fechaInicio.split('T')[0] : ''}" required />
      </div>
      <div class="form-group">
        <label>Fecha Fin <small>(opcional)</small></label>
        <input type="date" name="fechaFin" value="${c.fechaFin ? c.fechaFin.split('T')[0] : ''}" />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Actualizar</button>
      </div>
    </form>
  `);
}

async function actualizarContrato(e, id) {
    e.preventDefault();
    const form = e.target;
    const data = {
        id,
        empleadoId: parseInt(form.empleadoId.value),
        tipoContrato: form.tipoContrato.value,
        fechaInicio: form.fechaInicio.value,
        fechaFin: form.fechaFin.value || null
    };
    const res = await fetch(`${API_CONTRATOS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { closeModal(); paginasCargadas.delete('contratos'); loadContratos(); }
    else alert('Error al actualizar el contrato');
}

async function eliminarContrato(id) {
    if (!confirm('¿Eliminar este contrato?')) return;
    const res = await fetch(`${API_CONTRATOS}/${id}`, { method: 'DELETE' });
    if (res.ok) { paginasCargadas.delete('contratos'); loadContratos(); }
    else alert('Error al eliminar el contrato');
}