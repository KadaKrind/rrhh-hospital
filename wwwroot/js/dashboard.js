const API_DB_EMPLEADOS = https://rrhh-hospital-production.up.railway.app/api/empleados';
const API_DB_CONTRATOS = 'https://rrhh-hospital-production.up.railway.app/api/contratos';
const API_DB_PLANILLAS = 'https://rrhh-hospital-production.up.railway.app/api/planillas';
const API_DB_DESPIDOS = 'https://rrhh-hospital-production.up.railway.app/api/despidos';
const API_DB_TURNOS = 'https://rrhh-hospital-production.up.railway.app/api/turnos';
const API_DB_DEPARTAMENTOS = 'https://rrhh-hospital-production.up.railway.app/api/departamentos';
const API_DB_MIS = 'https://rrhh-hospital-production.up.railway.app/api/MIS';

async function loadDashboard() {
    const [empleados, contratos, planillas, despidos, turnos, deptos,
        porDepto, porTurno, porCargo, contratosXtipo] = await Promise.all([
            fetch(API_DB_EMPLEADOS).then(r => r.json()).catch(() => []),
            fetch(API_DB_CONTRATOS).then(r => r.json()).catch(() => []),
            fetch(API_DB_PLANILLAS).then(r => r.json()).catch(() => []),
            fetch(API_DB_DESPIDOS).then(r => r.json()).catch(() => []),
            fetch(API_DB_TURNOS).then(r => r.json()).catch(() => []),
            fetch(API_DB_DEPARTAMENTOS).then(r => r.json()).catch(() => []),
            fetch(`${API_DB_MIS}/resumen-personal-departamentos`).then(r => r.json()).catch(() => []),
            fetch(`${API_DB_MIS}/resumen-personal-por-turno`).then(r => r.json()).catch(() => []),
            fetch(`${API_DB_MIS}/suma-salarios-por-cargo`).then(r => r.json()).catch(() => []),
            fetch(`${API_DB_MIS}/contratos-por-tipo`).then(r => r.json()).catch(() => [])
        ]);

    const totalSalarios = empleados.reduce((s, e) => s + parseFloat(e.salarioBase || 0), 0);
    const totalNeto = planillas.reduce((s, p) => s + parseFloat(p.sueldoNeto || 0), 0);
    const maxDepto = porDepto.length ? Math.max(...porDepto.map(d => d.totalPersonal)) : 1;
    const maxTurno = porTurno.length ? Math.max(...porTurno.map(t => t.totalEmpleados)) : 1;

    const container = document.getElementById('page-dashboard');
    container.innerHTML = `
    <div class="dashboard-grid">

      <!-- KPIs -->
      <div class="kpi-card">
        <div class="kpi-icon">👥</div>
        <div class="kpi-info">
          <span class="kpi-value">${empleados.length}</span>
          <span class="kpi-label">Empleados activos</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">📄</div>
        <div class="kpi-info">
          <span class="kpi-value">${contratos.length}</span>
          <span class="kpi-label">Contratos</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">💰</div>
        <div class="kpi-info">
          <span class="kpi-value">Bs. ${(totalNeto / 1000).toFixed(1)}k</span>
          <span class="kpi-label">Total neto planillas</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🚪</div>
        <div class="kpi-info">
          <span class="kpi-value">${despidos.length}</span>
          <span class="kpi-label">Despidos</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🕐</div>
        <div class="kpi-info">
          <span class="kpi-value">${turnos.length}</span>
          <span class="kpi-label">Turnos</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🏥</div>
        <div class="kpi-info">
          <span class="kpi-value">${deptos.length}</span>
          <span class="kpi-label">Departamentos</span>
        </div>
      </div>

      <!-- Personal por departamento -->
      <div class="dashboard-card span-2">
        <h3>Personal por Departamento</h3>
        <ul class="bar-list">
          ${porDepto.length === 0
            ? '<li style="color:#aaa;font-size:0.85rem">Sin datos</li>'
            : porDepto.map(d => `
              <li class="bar-item">
                <div class="bar-label">
                  <span>${d.departamento} <small style="color:#aaa">(${d.codigo})</small></span>
                  <span>${d.totalPersonal} persona${d.totalPersonal !== 1 ? 's' : ''}</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" style="width:${Math.round((d.totalPersonal / maxDepto) * 100)}%"></div>
                </div>
              </li>
            `).join('')
        }
        </ul>
      </div>

      <!-- Distribución de turnos -->
      <div class="dashboard-card">
        <h3>Personal por Turno</h3>
        <ul class="bar-list">
          ${porTurno.length === 0
            ? '<li style="color:#aaa;font-size:0.85rem">Sin datos</li>'
            : porTurno.map(t => `
              <li class="bar-item">
                <div class="bar-label">
                  <span>${t.turno}</span>
                  <span>${t.totalEmpleados}</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" style="width:${Math.round((t.totalEmpleados / maxTurno) * 100)}%"></div>
                </div>
              </li>
            `).join('')
        }
        </ul>
      </div>

      <!-- Masa salarial por cargo -->
      <div class="dashboard-card span-2">
        <h3>Masa Salarial por Cargo</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Cargo</th>
              <th>Sueldo Base Total</th>
              <th>Descuentos</th>
              <th>Neto Total</th>
            </tr>
          </thead>
          <tbody>
            ${porCargo.length === 0
            ? `<tr><td colspan="4" class="empty-row">Sin datos</td></tr>`
            : porCargo.map(c => `
                <tr>
                  <td><strong>${c.cargo}</strong></td>
                  <td>Bs. ${parseFloat(c.totalSueldoBase).toFixed(2)}</td>
                  <td style="color:#c0392b">- Bs. ${parseFloat(c.totalDescuentos).toFixed(2)}</td>
                  <td style="color:#01696f;font-weight:700">Bs. ${parseFloat(c.totalSueldoNeto).toFixed(2)}</td>
                </tr>
              `).join('')
        }
          </tbody>
        </table>
      </div>

      <!-- Contratos por tipo -->
      <div class="dashboard-card">
        <h3>Contratos por Tipo</h3>
        <ul class="simple-list">
          ${contratosXtipo.length === 0
            ? '<li style="color:#aaa">Sin datos</li>'
            : contratosXtipo.map(c => `
              <li>
                <span class="list-code">${c.tipoContrato}</span>
                <span class="list-meta">${c.total} contrato${c.total !== 1 ? 's' : ''}</span>
              </li>
            `).join('')
        }
        </ul>
      </div>

      <!-- Resumen financiero -->
      <div class="dashboard-card span-2">
        <h3>Resumen Financiero</h3>
        <div class="salary-summary">
          <div class="salary-item">
            <span class="salary-label">Total Salarios Base</span>
            <span class="salary-value">Bs. ${totalSalarios.toFixed(2)}</span>
          </div>
          <div class="salary-item">
            <span class="salary-label">Total Neto Planillas</span>
            <span class="salary-value">Bs. ${totalNeto.toFixed(2)}</span>
          </div>
          <div class="salary-item">
            <span class="salary-label">Promedio Salario Base</span>
            <span class="salary-value">Bs. ${empleados.length ? (totalSalarios / empleados.length).toFixed(2) : '0.00'}</span>
          </div>
          <div class="salary-item">
            <span class="salary-label">Total Descuentos Planilla</span>
            <span class="salary-value" style="color:#c0392b">Bs. ${planillas.reduce((s, p) => s + parseFloat(p.descuentos || 0), 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <!-- Últimos empleados -->
      <div class="dashboard-card span-3">
        <h3>Últimos Empleados Registrados</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>CI</th>
              <th>Salario Base</th>
              <th>Fecha Contratación</th>
            </tr>
          </thead>
          <tbody>
            ${empleados.slice(-5).reverse().map(e => `
              <tr>
                <td><span class="list-code">${e.codigoEmpleado}</span></td>
                <td><strong>${e.nombre} ${e.apellido}</strong></td>
                <td>${e.ci}</td>
                <td>Bs. ${parseFloat(e.salarioBase).toFixed(2)}</td>
                <td>${e.fechaContratacion ? e.fechaContratacion.split('T')[0] : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

    </div>
  `;
}