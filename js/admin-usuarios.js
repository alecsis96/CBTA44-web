/**
 * Lógica para la gestión de usuarios (Admin)
 */

let allUsers = [];

// Cargar usuarios
window.loadUsers = async function () {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Cargando usuarios...</td></tr>';

    try {
        const { data: users, error } = await window.supabaseClient
            .from('perfiles')
            .select('*')
            .select('*');
        // .order('fecha_registro', { ascending: false }); // Columna no existe

        if (error) throw error;

        allUsers = users || [];
        renderUsers(allUsers);

    } catch (error) {
        console.error('Error cargando usuarios:', error);
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error al cargar usuarios.</td></tr>';
    }
};

// Renderizar tabla
function renderUsers(users) {
    const tableBody = document.getElementById('usersTableBody');

    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No se encontraron usuarios.</td></tr>';
        return;
    }

    tableBody.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');

        const avatar = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre_completo)}&background=random`;
        const date = '-'; // user.fecha_registro no existe

        const roleBadge = {
            'admin': '<span class="badge badge-primary">Admin</span>',
            'docente': '<span class="badge badge-success">Docente</span>',
            'alumno': '<span class="badge badge-info">Alumno</span>'
        }[user.rol] || `<span class="badge badge-secondary">${user.rol}</span>`;

        const isActive = user.activo !== false; // Default true if null
        const rowStyle = isActive ? '' : 'opacity: 0.6; background-color: #f9f9f9;';
        const statusBadge = isActive
            ? '<span class="badge badge-success" style="font-size: 0.7em;">Activo</span>'
            : '<span class="badge badge-danger" style="font-size: 0.7em;">Inactivo</span>';

        row.style = rowStyle;
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                    <div>
                        <div>${user.nombre_completo}</div>
                        ${!isActive ? '<small style="color: red;">(Desactivado)</small>' : ''}
                    </div>
                </div>
            </td>
            <td>${roleBadge}</td>
            <td>${user.email}</td>
            <td>${user.telefono || '-'}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-ghost btn-sm" onclick="editUser('${user.id}')" title="Editar">✏️</button>
                ${isActive
                ? `<button class="btn btn-ghost btn-sm" style="color: var(--color-error);" onclick="deleteUser('${user.id}')" title="Desactivar">🚫</button>`
                : `<button class="btn btn-ghost btn-sm" style="color: var(--color-success);" onclick="reactivateUser('${user.id}')" title="Reactivar">✅</button>`
            }
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Filtrar usuarios
function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;

    const filtered = allUsers.filter(user => {
        const matchesSearch = user.nombre_completo.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);
        const matchesRole = roleFilter ? user.rol === roleFilter : true;

        return matchesSearch && matchesRole;
    });

    renderUsers(filtered);
}

document.getElementById('searchInput').addEventListener('input', filterUsers);
document.getElementById('roleFilter').addEventListener('change', filterUsers);

// Guardar usuario (Crear o Editar)
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Guardando...';
    saveBtn.disabled = true;

    const userId = document.getElementById('userId').value;
    const name = document.getElementById('userNameInput').value;
    const email = document.getElementById('userEmail').value;
    const role = document.getElementById('userRole').value;
    const phone = document.getElementById('userPhone').value;
    const password = document.getElementById('userPassword').value;

    try {
        if (userId) {
            // EDITAR
            const { error } = await window.supabaseClient
                .from('perfiles')
                .update({
                    nombre_completo: name,
                    rol: role,
                    telefono: phone
                })
                .eq('id', userId);

            if (error) throw error;
            alert('Usuario actualizado correctamente');

        } else {
            // CREAR (Usando AuthManager para registrar en Auth y BD)
            await authManager.register({
                email: email,
                password: password,
                name: name,
                role: role
            });

            // Actualizar teléfono si se proporcionó (register solo guarda lo básico)
            if (phone) {
                // Necesitamos buscar el ID del usuario recién creado por email
                const { data: newUser } = await window.supabaseClient
                    .from('perfiles')
                    .select('id')
                    .eq('email', email)
                    .single();

                if (newUser) {
                    await window.supabaseClient
                        .from('perfiles')
                        .update({ telefono: phone })
                        .eq('id', newUser.id);
                }
            }

            alert('Usuario creado correctamente');
        }

        window.closeModal();
        window.loadUsers();

    } catch (error) {
        console.error('Error guardando usuario:', error);
        alert('Error: ' + error.message);
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
});

// Editar usuario (Cargar datos en modal)
window.editUser = function (id) {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;

    document.getElementById('userId').value = user.id;
    document.getElementById('userNameInput').value = user.nombre_completo;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.rol;
    document.getElementById('userPhone').value = user.telefono || '';

    window.openModal(id);
};

// Eliminar usuario
// Eliminar usuario (Soft Delete)
window.deleteUser = async function (id) {
    if (!confirm('¿Estás seguro de desactivar este usuario? El usuario no podrá iniciar sesión, pero sus datos se conservarán.')) return;

    try {
        const { error } = await window.supabaseClient
            .from('perfiles')
            .update({ activo: false })
            .eq('id', id);

        if (error) throw error;

        alert('Usuario desactivado correctamente.');
        window.loadUsers();

    } catch (error) {
        console.error('Error desactivando usuario:', error);
        alert('Error al desactivar: ' + error.message);
    }
};

// Reactivar usuario (Opcional, pero útil)
window.reactivateUser = async function (id) {
    if (!confirm('¿Deseas reactivar este usuario?')) return;

    try {
        const { error } = await window.supabaseClient
            .from('perfiles')
            .update({ activo: true })
            .eq('id', id);

        if (error) throw error;

        alert('Usuario reactivado correctamente.');
        window.loadUsers();

    } catch (error) {
        console.error('Error reactivando usuario:', error);
        alert('Error al reactivar: ' + error.message);
    }
};
