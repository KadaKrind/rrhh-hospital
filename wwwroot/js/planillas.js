const API_PLANILLAS = 'http://localhost:5205/api/planillas';

async function loadPlanillas() {
    const planillas = await fetch(API_PLANILLAS).then(r => r.json()).catch(() => []);

    const container = document.getElementById('page-planillas');
    container.innerHTML = `
    <div class="page-header-actions">
      <button class="btn btn-primary" onclick="abrirModalNuevaPlanilla()">+ Nueva Planilla</button>
    </div>
    <div class="table-wrapper">
      <table class="data-table" id="tabla-planillas">
        <thead>
          <tr>
            <th>Código</th>
            <th>Empleado</th>
            <th>Cargo</th>
            <th>Sueldo Base</th>
            <th>Descuentos</th>
            <th>Sueldo Neto</th>
            <th>Gestión</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${planillas.length === 0
            ? `<tr><td colspan="8" class="empty-row">No hay planillas registradas</td></tr>`
            : planillas.map(p => `
              <tr>
                <td>${p.codigoPlanilla}</td>
                <td>${p.empleado}</td>
                <td>${p.cargo || '-'}</td>
                <td>Bs. ${parseFloat(p.sueldoBase).toFixed(2)}</td>
                <td>Bs. ${parseFloat(p.descuentos).toFixed(2)}</td>
                <td><strong>Bs. ${parseFloat(p.sueldoNeto).toFixed(2)}</strong></td>
                <td>${p.gestion || '-'}</td>
                <td>
                  <button class="btn btn-sm btn-secondary" onclick="abrirModalEditarPlanilla(${p.id})">Editar</button>
                  <button class="btn btn-sm btn-danger" onclick="eliminarPlanilla(${p.id})">Eliminar</button>
                </td>
              </tr>
            `).join('')
        }
        </tbody>
      </table>
    </div>
  `;
}

function abrirModalNuevaPlanilla() {
    openModal(`
    <h2>Nueva Planilla</h2>
    <form onsubmit="guardarPlanilla(event)">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoPlanilla" placeholder="Ej: PLA-016" required />
      </div>
      <div class="form-group">
        <label>Empleado (nombre completo)</label>
        <input type="text" name="empleado" placeholder="Ej: Juan Perez" required />
      </div>
      <div class="form-group">
        <label>Cargo</label>
        <input type="text" name="cargo" placeholder="Ej: Médico General" />
      </div>
      <div class="form-group">
        <label>Sueldo Base (Bs.)</label>
        <input type="number" name="sueldoBase" step="0.01" min="0" required />
      </div>
      <div class="form-group">
        <label>Descuentos (Bs.)</label>
        <input type="number" name="descuentos" step="0.01" min="0" value="0" required />
      </div>
      <div class="form-group">
        <label>Gestión (año)</label>
        <input type="text" name="gestion" placeholder="Ej: 2026" required />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar</button>
      </div>
    </form>
  `);
}

async function guardarPlanilla(e) {
    e.preventDefault();
    const form = e.target;
    const sueldoBase = parseFloat(form.sueldoBase.value);
    const descuentos = parseFloat(form.descuentos.value);
    const data = {
        codigoPlanilla: form.codigoPlanilla.value,
        empleado: form.empleado.value,
        cargo: form.cargo.value,
        sueldoBase,
        descuentos,
        sueldoNeto: sueldoBase - descuentos,
        gestion: form.gestion.value
    };
    const res = await fetch(API_PLANILLAS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { closeModal(); paginasCargadas.delete('planillas'); loadPlanillas(); }
    else alert('Error al guardar la planilla');
}

async function abrirModalEditarPlanilla(id) {
    const p = await fetch(`${API_PLANILLAS}/${id}`).then(r => r.json());
    openModal(`
    <h2>Editar Planilla</h2>
    <form onsubmit="actualizarPlanilla(event, ${id})">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoPlanilla" value="${p.codigoPlanilla}" required />
      </div>
      <div class="form-group">
        <label>Empleado</label>
        <input type="text" name="empleado" value="${p.empleado}" required />
      </div>
      <div class="form-group">
        <label>Cargo</label>
        <input type="text" name="cargo" value="${p.cargo || ''}" />
      </div>
      <div class="form-group">
        <label>Sueldo Base (Bs.)</label>
        <input type="number" name="sueldoBase" step="0.01" value="${p.sueldoBase}" required />
      </div>
      <div class="form-group">
        <label>Descuentos (Bs.)</label>
        <input type="number" name="descuentos" step="0.01" value="${p.descuentos}" required />
      </div>
      <div class="form-group">
        <label>Gestión</label>
        <input type="text" name="gestion" value="${p.gestion || ''}" required />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Actualizar</button>
      </div>
    </form>
  `);
}

async function actualizarPlanilla(e, id) {
    e.preventDefault();
    const form = e.target;
    const sueldoBase = parseFloat(form.sueldoBase.value);
    const descuentos = parseFloat(form.descuentos.value);
    const data = {
        id,
        codigoPlanilla: form.codigoPlanilla.value,
        empleado: form.empleado.value,
        cargo: form.cargo.value,
        sueldoBase,
        descuentos,
        sueldoNeto: sueldoBase - descuentos,
        gestion: form.gestion.value
    };
    const res = await fetch(`${API_PLANILLAS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { closeModal(); paginasCargadas.delete('planillas'); loadPlanillas(); }
    else alert('Error al actualizar la planilla');
}

async function eliminarPlanilla(id) {
    if (!confirm('¿Eliminar esta planilla?')) return;
    const res = await fetch(`${API_PLANILLAS}/${id}`, { method: 'DELETE' });
    if (res.ok) { paginasCargadas.delete('planillas'); loadPlanillas(); }
    else alert('Error al eliminar la planilla');
}