const API_BASE = 'https://rrhh-hospital-production.up.railway.app/api';

const api = {
    get: async (endpoint) => {
        const res = await fetch(`${API_BASE}${endpoint}`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
    },
    post: async (endpoint, data) => {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
    },
    put: async (endpoint, data) => {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
    }
};

// Helpers para obtener último código y autoincrementar
async function siguienteCodigo(endpoint, campo, prefijo) {
    try {
        const data = await api.get(endpoint);
        if (!data.length) return `${prefijo}-001`;
        const nums = data.map(d => parseInt(d[campo].split('-')[1])).filter(n => !isNaN(n));
        const max = Math.max(...nums);
        return `${prefijo}-${String(max + 1).padStart(3, '0')}`;
    } catch { return `${prefijo}-001`; }
}
// ── GENERADOR DE CÓDIGO AUTOMÁTICO ───────────────────────────
async function generarSiguienteCodigo(apiUrl, campo, prefijo, digitos = 3) {
    try {
        const lista = await fetch(apiUrl).then(r => r.json());
        if (!lista || !lista.length)
            return `${prefijo}-${'1'.padStart(digitos, '0')}`;

        const numeros = lista
            .map(item => {
                const val = item[campo] || '';
                const num = parseInt(val.replace(prefijo + '-', ''));
                return isNaN(num) ? 0 : num;
            })
            .filter(n => n > 0);

        const siguiente = numeros.length ? Math.max(...numeros) + 1 : 1;
        return `${prefijo}-${String(siguiente).padStart(digitos, '0')}`;
    } catch {
        return `${prefijo}-001`;
    }
}

// ── ORDENAMIENTO DE TABLAS ────────────────────────────────────
let _sortState = { tableId: null, col: null, dir: 'asc' };

function makeTableSortable(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    table.querySelectorAll('thead th').forEach((th, i) => {
        if (th.textContent.trim().toLowerCase() === 'acciones') return;

        th.style.cursor = 'pointer';
        th.style.userSelect = 'none';
        th.setAttribute('data-col', i);

        const icon = document.createElement('span');
        icon.className = 'sort-icon';
        icon.textContent = ' ⇅';
        th.appendChild(icon);

        th.addEventListener('click', () => {
            const isSame = _sortState.tableId === tableId && _sortState.col === i;
            _sortState = {
                tableId,
                col: i,
                dir: (isSame && _sortState.dir === 'asc') ? 'desc' : 'asc'
            };

            // Resetear iconos
            table.querySelectorAll('.sort-icon').forEach(ic => {
                ic.textContent = ' ⇅';
                ic.style.opacity = '0.35';
                ic.style.color = '';
            });
            // Activar ícono actual
            const icon = th.querySelector('.sort-icon');
            icon.textContent = _sortState.dir === 'asc' ? ' ↑' : ' ↓';
            icon.style.opacity = '1';
            icon.style.color = 'var(--accent)';

            // Ordenar filas
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr[data-nombre], tr:not(.empty-row)'));

            rows.sort((a, b) => {
                const aText = (a.cells[i]?.textContent || '').trim();
                const bText = (b.cells[i]?.textContent || '').trim();
                const aNum = parseFloat(aText.replace(/[^0-9.-]/g, ''));
                const bNum = parseFloat(bText.replace(/[^0-9.-]/g, ''));
                const isNum = !isNaN(aNum) && !isNaN(bNum) && aText !== '' && bText !== '';
                const cmp = isNum ? aNum - bNum : aText.localeCompare(bText, 'es', { numeric: true });
                return _sortState.dir === 'asc' ? cmp : -cmp;
            });

            rows.forEach(r => tbody.appendChild(r));
        });
    });
}