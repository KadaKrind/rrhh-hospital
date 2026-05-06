const API_EMPLEADOS = 'https://rrhh-hospital-production.up.railway.app/api/empleados';
const API_MIS = 'https://rrhh-hospital-production.up.railway.app/api/MIS';

async function loadEmpleados() {
    const [detalle, cargos] = await Promise.all([
        fetch(`${API_MIS}/empleados-activos-detalle`).then(r => r.json()).catch(() => []),
        fetch('https://rrhh-hospital-production.up.railway.app/api/cargos').then(r => r.json()).catch(() => [])
    ]);

    const container = document.getElementById('page-empleados');
    container.innerHTML = `
    <div class="page-header-actions">
      <div class="filters">
        <input type="text" id="buscar-empleado" placeholder="Buscar por nombre o código..." oninput="filtrarEmpleados()" />
        <select id="filtro-cargo" onchange="filtrarEmpleados()">
          <option value="">Todos los cargos</option>
          ${cargos.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary" onclick="abrirModalNuevoEmpleado()">+ Nuevo Empleado</button>
    </div>

    <div class="table-wrapper">
      <table class="data-table" id="tabla-empleados">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre Completo</th>
            <th>Cargo</th>
            <th>Turno</th>
            <th>Departamento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="tbody-empleados">
          ${detalle.length === 0
            ? `<tr><td colspan="6" class="empty-row">No hay empleados activos</td></tr>`
            : detalle.map(e => `
              <tr data-nombre="${e.empleado.toLowerCase()}" data-codigo="${e.codigoEmpleado.toLowerCase()}" data-cargo="${(e.cargo || '').toLowerCase()}">
                <td>${e.codigoEmpleado}</td>
                <td>${e.empleado}</td>
                <td>${e.cargo || '-'}</td>
                <td>${e.turno || '-'}</td>
                <td>${e.departamento || '-'}</td>
                <td>
                  <button class="btn btn-sm btn-secondary" onclick="verDetalleEmpleado('${e.codigoEmpleado}')">Ver</button>
                  <button class="btn btn-sm btn-danger" onclick="abrirModalDespido('${e.codigoEmpleado}', '${e.empleado}')">Despedir</button>
                </td>
              </tr>
            `).join('')
        }
        </tbody>
      </table>
    </div>
  `;
    makeTableSortable('tabla-empleados');
}

function filtrarEmpleados() {
    const texto = document.getElementById('buscar-empleado').value.toLowerCase();
    const cargo = document.getElementById('filtro-cargo').value.toLowerCase();
    const filas = document.querySelectorAll('#tbody-empleados tr[data-nombre]');

    filas.forEach(fila => {
        const matchTexto = fila.dataset.nombre.includes(texto) || fila.dataset.codigo.includes(texto);
        const matchCargo = !cargo || fila.dataset.cargo.includes(cargo);
        fila.style.display = matchTexto && matchCargo ? '' : 'none';
    });
}

async function verDetalleEmpleado(codigo) {
    const e = await fetch(`${API_MIS}/buscar-empleado/${codigo}`).then(r => r.json()).catch(() => null);
    if (!e) { alert('No se pudo cargar el detalle'); return; }

    openModal(`
    <h2>Detalle de Empleado</h2>
    <div class="detalle-grid">
      <div class="detalle-item"><span class="detalle-label">Código</span><span>${e.codigoEmpleado}</span></div>
      <div class="detalle-item"><span class="detalle-label">CI</span><span>${e.ci || '-'}</span></div>
      <div class="detalle-item"><span class="detalle-label">Nombre</span><span>${e.empleado}</span></div>
      <div class="detalle-item"><span class="detalle-label">Email</span><span>${e.email || '-'}</span></div>
      <div class="detalle-item"><span class="detalle-label">Teléfono</span><span>${e.telefono || '-'}</span></div>
      <div class="detalle-item"><span class="detalle-label">Cargo</span><span>${e.cargo || '-'}</span></div>
      <div class="detalle-item"><span class="detalle-label">Fecha Ingreso</span><span>${e.fechaIngreso ? e.fechaIngreso.split('T')[0] : '-'}</span></div>
    </div>
    <div class="form-actions" style="margin-top:1rem">
      <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
    </div>
  `);
}

async function abrirModalNuevoEmpleado() {
    const codigo = await generarSiguienteCodigo(API_EMPLEADOS, 'codigoEmpleado', 'EMP');
    const cargos = await fetch('https://rrhh-hospital-production.up.railway.app/api/cargos').then(r => r.json()).catch(() => []);

    openModal(`
    <h2>Nuevo Empleado</h2>
    <form onsubmit="guardarEmpleado(event)">
      <div class="form-group">
        <label>Código</label>
        <input type="text" name="codigoEmpleado" value="${codigo}" readonly
               style="background:var(--surface-2);color:var(--text-muted);cursor:not-allowed;" />
      </div>
      <div class="form-group">
        <label>CI</label>
        <input type="text" name="ci" placeholder="Ej: 1234567" required />
      </div>
      <div class="form-group">
        <label>Nombre</label>
        <input type="text" name="nombre" required />
      </div>
      <div class="form-group">
        <label>Apellido</label>
        <input type="text" name="apellido" required />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" name="email" placeholder="correo@hospital.com" />
      </div>
      <div class="form-group">
        <label>Teléfono</label>
        <input type="text" name="telefono" placeholder="Ej: 70000000" />
      </div>
      <div class="form-group">
        <label>Fecha de Ingreso</label>
        <input type="date" name="fechaIngreso" required />
      </div>
      <div class="form-group">
        <label>Fecha de Contratación</label>
        <input type="date" name="fechaContratacion" required />
      </div>
      <div class="form-group">
        <label>Cargo</label>
        <select name="cargoId" required>
          <option value="">Seleccionar cargo...</option>
          ${cargos.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Salario Base (Bs.)</label>
        <input type="number" name="salarioBase" step="0.01" min="0" required />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar</button>
      </div>
    </form>
  `);
}

async function guardarEmpleado(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        codigoEmpleado: form.codigoEmpleado.value,
        ci: form.ci.value,
        nombre: form.nombre.value,
        apellido: form.apellido.value,
        email: form.email.value,
        telefono: form.telefono.value,
        fechaIngreso: form.fechaIngreso.value,
        fechaContratacion: form.fechaContratacion.value,
        salarioBase: parseFloat(form.salarioBase.value),
        cargoId: parseInt(form.cargoId.value),
        estado: 'Activo'
    };
    const res = await fetch(API_EMPLEADOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { closeModal(); paginasCargadas.delete('empleados'); loadEmpleados(); }
    else alert('Error al guardar el empleado');
}

function abrirModalDespido(codigo, nombre) {
    openModal(`
    <h2>Registrar Despido</h2>
    <p style="margin-bottom:1rem">Empleado: <strong>${nombre}</strong></p>
    <form onsubmit="guardarDespidoMIS(event, '${codigo}')">
      <div class="form-group">
        <label>Motivo</label>
        <textarea name="motivo" rows="3" placeholder="Motivo del despido..." required></textarea>
      </div>
      <div class="form-group">
        <label>Fecha</label>
        <input type="date" name="fecha" required />
      </div>
      <div class="form-group">
        <label>Registrado por</label>
        <input type="text" name="registradoPor" placeholder="Nombre del responsable" />
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-danger">Confirmar Despido</button>
      </div>
    </form>
  `);
}

async function guardarDespidoMIS(e, codigoEmpleado) {
    e.preventDefault();
    const form = e.target;

    const emp = await fetch(`${API_MIS}/buscar-empleado/${codigoEmpleado}`).then(r => r.json()).catch(() => null);
    if (!emp) { alert('No se encontró el empleado'); return; }

    const data = {
        empleadoId: emp.id,
        motivo: form.motivo.value,
        fechaDespido: form.fecha.value,
        registradoPor: form.registradoPor.value
    };
    const res = await fetch(`${API_MIS}/despido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) {
        closeModal();
        paginasCargadas.delete('empleados');
        paginasCargadas.delete('despidos');
        loadEmpleados();
        alert('Despido registrado correctamente');
    } else alert('Error al registrar el despido');
}