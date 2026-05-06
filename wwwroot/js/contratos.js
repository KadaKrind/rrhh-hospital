const API_CONTRATOS = 'http://localhost:5205/api/contratos';

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
                  <button class="btn btn-sm btn-secondary" onclick='abrirModalEditarContrato(${JSON.stringify(c)})'>Editar</button>
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
    const codigo = await generarSiguienteCodigo(API_CONTRATOS, 'codigoContrato', 'CON');

    openModal(`
    <h2>Nuevo Contrato</h2>
    <form onsubmit="guardarContrato(event)">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoContrato" value="${codigo}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Empleado (nombre completo)</label>
        <input type="text" name="empleado" placeholder="Ej: Juan Perez" required />
      </div>
      <div class="form-group">
        <label>Tipo de Contrato</label>
        <select name="tipoContrato" required>
          <option value="">-- Seleccionar --</option>
          <option value="Indefinido">Indefinido</option>
          <option value="Temporal">Temporal</option>
          <option value="Por Obra">Por Obra</option>
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
        empleado: form.empleado.value,
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
    else alert('Error al guardar el contrato');
}

function abrirModalEditarContrato(c) {
    openModal(`
    <h2>Editar Contrato</h2>
    <form onsubmit="actualizarContrato(event, ${c.id})">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoContrato" value="${c.codigoContrato}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Empleado</label>
        <input type="text" name="empleado" value="${c.empleado || ''}" required />
      </div>
      <div class="form-group">
        <label>Tipo de Contrato</label>
        <select name="tipoContrato" required>
          <option value="Indefinido" ${c.tipoContrato === 'Indefinido' ? 'selected' : ''}>Indefinido</option>
          <option value="Temporal"   ${c.tipoContrato === 'Temporal' ? 'selected' : ''}>Temporal</option>
          <option value="Por Obra"   ${c.tipoContrato === 'Por Obra' ? 'selected' : ''}>Por Obra</option>
        </select>
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
        codigoContrato: form.codigoContrato.value,
        empleado: form.empleado.value,
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