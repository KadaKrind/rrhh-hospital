const API_PLANILLAS = 'https://rrhh-hospital-production.up.railway.app/api/planillas';
const API_EMPLEADOS_PL = 'https://rrhh-hospital-production.up.railway.app/api/empleados';
const API_CARGOS_PL = 'https://rrhh-hospital-production.up.railway.app/api/cargos';

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
    makeTableSortable('tabla-planillas');
}

async function abrirModalNuevaPlanilla() {
    const [codigo, empleados, cargos] = await Promise.all([
        generarSiguienteCodigo(API_PLANILLAS, 'codigoPlanilla', 'PLA'),
        fetch(API_EMPLEADOS_PL).then(r => r.json()).catch(() => []),
        fetch(API_CARGOS_PL).then(r => r.json()).catch(() => [])
    ]);

    const optsEmp = empleados.map(e =>
        `<option value="${e.id}" data-sueldo="${e.salarioBase ?? 0}">${e.nombre} ${e.apellido}</option>`
    ).join('');
    const optsCar = cargos.map(c =>
        `<option value="${c.id}" data-descripcion="${c.descripcion ?? ''}">${c.nombre}</option>`
    ).join('');

    openModal(`
    <h2>Nueva Planilla</h2>
    <form onsubmit="guardarPlanilla(event)">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoPlanilla" value="${codigo}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Empleado</label>
        <select name="empleadoId" required onchange="autocompletarSueldo(this)">
          <option value="">-- Seleccionar --</option>${optsEmp}
        </select>
      </div>
      <div class="form-group">
        <label>Cargo</label>
        <select name="cargoId" required onchange="autocompletarCargo(this)">
          <option value="">-- Seleccionar --</option>${optsCar}
        </select>
      </div>
      <div class="form-group">
        <label>Descripción del Cargo</label>
        <input type="text" name="cargodesc" readonly placeholder="Se llena al seleccionar cargo"
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Sueldo Base (Bs.)</label>
        <input type="number" name="sueldoBase" step="0.01" min="0" required
               oninput="calcularNeto(this.form)" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Descuentos (Bs.)</label>
        <input type="number" name="descuentos" step="0.01" min="0" value="0"
               required oninput="calcularNeto(this.form)" />
      </div>
      <div class="form-group">
        <label>Sueldo Neto (Bs.)</label>
        <input type="number" name="sueldoNeto" step="0.01" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Gestión (ej: 2026-1)</label>
        <input type="text" name="gestion" placeholder="Ej: 2026-1" required />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar</button>
      </div>
    </form>
  `);
}

function autocompletarSueldo(select) {
    const form = select.closest('form');
    const opt = select.options[select.selectedIndex];
    const sueldo = parseFloat(opt.dataset.sueldo) || 0;
    form.sueldoBase.value = sueldo.toFixed(2);
    calcularNeto(form);
}

function autocompletarCargo(select) {
    const form = select.closest('form');
    const opt = select.options[select.selectedIndex];
    form.cargodesc.value = opt.dataset.descripcion || '';
}

function calcularNeto(form) {
    const base = parseFloat(form.sueldoBase.value) || 0;
    const desc = parseFloat(form.descuentos.value) || 0;
    form.sueldoNeto.value = (base - desc).toFixed(2);
}

async function guardarPlanilla(e) {
    e.preventDefault();
    const form = e.target;
    const sueldoBase = parseFloat(form.sueldoBase.value);
    const descuentos = parseFloat(form.descuentos.value);
    const data = {
        codigoPlanilla: form.codigoPlanilla.value,
        empleadoId: parseInt(form.empleadoId.value),
        cargoId: parseInt(form.cargoId.value),
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
    else {
        const err = await res.json().catch(() => ({}));
        alert('Error: ' + (err.mensaje || 'No se pudo guardar la planilla'));
    }
}

async function abrirModalEditarPlanilla(id) {
    const [p, empleados, cargos] = await Promise.all([
        fetch(`${API_PLANILLAS}/${id}`).then(r => r.json()),
        fetch(API_EMPLEADOS_PL).then(r => r.json()).catch(() => []),
        fetch(API_CARGOS_PL).then(r => r.json()).catch(() => [])
    ]);

    const optsEmp = empleados.map(e =>
        `<option value="${e.id}" data-sueldo="${e.salarioBase ?? 0}" ${e.id === p.empleadoId ? 'selected' : ''}>${e.nombre} ${e.apellido}</option>`
    ).join('');
    const optsCar = cargos.map(c =>
        `<option value="${c.id}" data-descripcion="${c.descripcion ?? ''}" ${c.id === p.cargoId ? 'selected' : ''}>${c.nombre}</option>`
    ).join('');

    // Precarga descripcion del cargo seleccionado
    const cargoSeleccionado = cargos.find(c => c.id === p.cargoId);
    const descCargo = cargoSeleccionado?.descripcion ?? '';

    openModal(`
    <h2>Editar Planilla</h2>
    <form onsubmit="actualizarPlanilla(event, ${id})">
      <div class="form-group">
        <label>Empleado</label>
        <select name="empleadoId" required onchange="autocompletarSueldo(this)">
          <option value="">-- Seleccionar --</option>${optsEmp}
        </select>
      </div>
      <div class="form-group">
        <label>Cargo</label>
        <select name="cargoId" required onchange="autocompletarCargo(this)">
          <option value="">-- Seleccionar --</option>${optsCar}
        </select>
      </div>
      <div class="form-group">
        <label>Descripción del Cargo</label>
        <input type="text" name="cargodesc" value="${descCargo}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Sueldo Base (Bs.)</label>
        <input type="number" name="sueldoBase" step="0.01" value="${p.sueldoBase}" required
               oninput="calcularNeto(this.form)" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>Descuentos (Bs.)</label>
        <input type="number" name="descuentos" step="0.01" value="${p.descuentos}"
               required oninput="calcularNeto(this.form)" />
      </div>
      <div class="form-group">
        <label>Sueldo Neto (Bs.)</label>
        <input type="number" name="sueldoNeto" step="0.01" value="${p.sueldoNeto}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
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
        empleadoId: parseInt(form.empleadoId.value),
        cargoId: parseInt(form.cargoId.value),
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