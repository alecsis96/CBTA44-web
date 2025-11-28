/**
 * CBTA #44 - Gestión de Admisiones (Admin)
 */

// Event listener removed to avoid race conditions. 
// loadAdmisiones() will be called from admisiones.html after auth init.

/**
 * Cargar lista de admisiones desde Supabase
 */
async function loadAdmisiones() {
    const tableBody = document.getElementById('admisionesTableBody');
    if (!tableBody) return;

    try {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Cargando datos...</td></tr>';

        const { data, error } = await window.supabaseClient
            .from('admisiones')
            .select('*')
            .order('fecha_registro', { ascending: false });

        if (error) throw error;

        renderAdmisionesTable(data);

    } catch (error) {
        console.error('Error al cargar admisiones:', error);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error al cargar los datos</td></tr>';
        window.CBTA44Utils.showNotification('Error al cargar las solicitudes', 'error');
    }
}

/**
 * Renderizar tabla de admisiones
 */
function renderAdmisionesTable(admisiones) {
    const tableBody = document.getElementById('admisionesTableBody');
    if (!tableBody) return;

    if (admisiones.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay solicitudes registradas</td></tr>';
        return;
    }

    tableBody.innerHTML = admisiones.map(solicitud => `
        <tr>
            <td>
                <div class="font-bold">${solicitud.nombre_completo}</div>
                <div class="text-sm text-gray">${solicitud.curp}</div>
            </td>
            <td>${solicitud.email}<br>${solicitud.telefono}</td>
            <td>${solicitud.escuela_procedencia}<br>Promedio: <strong>${solicitud.promedio}</strong></td>
            <td>${solicitud.carrera_interes}</td>
            <td>${window.CBTA44Utils.formatDateShort(solicitud.fecha_registro)}</td>
            <td>
                <span class="badge badge-${getStatusBadge(solicitud.estatus)}">
                    ${solicitud.estatus.toUpperCase()}
                </span>
            </td>
            <td>
                <div class="flex gap-sm">
                    ${solicitud.estatus === 'pendiente' ? `
                        <button class="btn btn-success btn-sm" onclick="updateStatus('${solicitud.id}', 'aceptado')">✓</button>
                        <button class="btn btn-danger btn-sm" onclick="updateStatus('${solicitud.id}', 'rechazado')">✕</button>
                    ` : ''}
                    <button class="btn btn-ghost btn-sm" onclick="viewDetails('${solicitud.id}')">👁️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Obtener color del badge según estatus
 */
function getStatusBadge(status) {
    switch (status) {
        case 'aceptado': return 'success';
        case 'rechazado': return 'error'; // o danger si existe en CSS
        case 'pendiente': return 'warning';
        default: return 'primary';
    }
}

/**
 * Actualizar estatus de una solicitud
 */
window.updateStatus = async (id, newStatus) => {
    if (!confirm(`¿Estás seguro de cambiar el estatus a ${newStatus.toUpperCase()}?`)) return;

    try {
        const { error } = await window.supabaseClient
            .from('admisiones')
            .update({ estatus: newStatus })
            .eq('id', id);

        if (error) throw error;

        window.CBTA44Utils.showNotification(`Solicitud ${newStatus} correctamente`, 'success');
        loadAdmisiones(); // Recargar tabla

    } catch (error) {
        console.error('Error al actualizar estatus:', error);
        window.CBTA44Utils.showNotification('Error al actualizar la solicitud', 'error');
    }
};

/**
 * Ver detalles de la solicitud (simple alert por ahora)
 */
window.viewDetails = async (id) => {
    try {
        const { data, error } = await window.supabaseClient
            .from('admisiones')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        alert(`
            Detalles de Solicitud:
            ----------------------
            Nombre: ${data.nombre_completo}
            CURP: ${data.curp}
            Email: ${data.email}
            Teléfono: ${data.telefono}
            Escuela: ${data.escuela_procedencia}
            Promedio: ${data.promedio}
            Carrera: ${data.carrera_interes}
            Fecha: ${new Date(data.fecha_registro).toLocaleString()}
            Estatus: ${data.estatus}
        `);

    } catch (error) {
        console.error('Error al obtener detalles:', error);
    }
};
