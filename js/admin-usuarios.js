/**
 * Lógica para la gestión de usuarios (Admin)
 */

import { supabaseClient } from './supabase-config.js';
import { authManager } from './auth.js';

let allUsers = [];

// Cargar usuarios
export async function loadUsers() {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Cargando usuarios...</td></tr>';

    try {
        const { data: users, error } = await supabaseClient
            .from('perfiles')
            .select('*');

        if (error) throw error;

        allUsers = users || [];
        renderUsers(allUsers);

    } catch (error) {
        console.error('Error cargando usuarios:', error);
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error al cargar usuarios.</td></tr>';
    }
}

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
                <button class="btn btn-ghost btn-sm" onclick="window.editUser('${user.id}')" title="Editar">✏️</button>
                ${isActive
                ? `<button class="btn btn-ghost btn-sm" style="color: var(--color-error);" onclick="window.deleteUser('${user.id}')" title="Desactivar">🚫</button>`
                : `<button class="btn btn-ghost btn-sm" style="color: var(--color-success);" onclick="window.reactivateUser('${user.id}')" title="Reactivar">✅</button>`
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

const searchInput = document.getElementById('searchInput');
if (searchInput) searchInput.addEventListener('input', filterUsers);

const roleFilter = document.getElementById('roleFilter');
if (roleFilter) roleFilter.addEventListener('change', filterUsers);

// Guardar usuario (Crear o Editar)
// Guardar usuario (Crear o Editar)
const userForm = document.getElementById('userForm');
if (userForm) {
    // Lógica de Generación de Contraseña
    const generateBtn = document.getElementById('generatePasswordBtn');
    const autoCheck = document.getElementById('autoPasswordCheckbox');
    const passwordInput = document.getElementById('userPassword');
    const roleSelect = document.getElementById('userRole');

    function generateSecurePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let pass = '';
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    }

    function generateMatriculaPassword() {
        // Simular matrícula: 44 + año + 4 digitos random
        const year = new Date().getFullYear().toString().slice(-2);
        const random = Math.floor(1000 + Math.random() * 9000);
        return `44${year}${random}`;
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            passwordInput.value = generateSecurePassword();
            passwordInput.type = 'text'; // Mostrar temporalmente
            setTimeout(() => passwordInput.type = 'password', 3000);
        });
    }

    if (autoCheck) {
        autoCheck.addEventListener('change', () => {
            if (autoCheck.checked) {
                if (roleSelect.value === 'alumno') {
                    passwordInput.value = generateMatriculaPassword();
                } else {
                    passwordInput.value = generateSecurePassword();
                }
                passwordInput.setAttribute('readonly', 'true');
                passwordInput.type = 'text';
            } else {
                passwordInput.removeAttribute('readonly');
                passwordInput.value = '';
                passwordInput.type = 'password';
            }
        });
    }

    if (roleSelect) {
        roleSelect.addEventListener('change', () => {
            if (autoCheck && autoCheck.checked && roleSelect.value === 'alumno') {
                passwordInput.value = generateMatriculaPassword();
            } else if (autoCheck && autoCheck.checked) {
                passwordInput.value = generateSecurePassword();
            }
        });
    }

    userForm.addEventListener('submit', async (e) => {
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
                const { error } = await supabaseClient
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
                // CREAR (Usando AuthManager.adminCreateUser)
                await authManager.adminCreateUser(email, password, {
                    name: name,
                    role: role,
                    phone: phone
                });

                // Mostrar credenciales al admin
                alert(`✅ Usuario creado exitosamente.\n\n📧 Email: ${email}\n🔑 Contraseña: ${password}\n\n⚠️ COPIA ESTOS DATOS Y ENTREGALOS AL USUARIO.`);
            }

            closeModal();
            loadUsers();

        } catch (error) {
            console.error('Error guardando usuario:', error);
            alert('Error: ' + error.message);
        } finally {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    });
}

// Editar usuario (Cargar datos en modal)
function editUser(id) {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;

    document.getElementById('userId').value = user.id;
    document.getElementById('userNameInput').value = user.nombre_completo;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.rol;
    document.getElementById('userPhone').value = user.telefono || '';

    openModal(id);
}

// Eliminar usuario (Soft Delete)
async function deleteUser(id) {
    if (!confirm('¿Estás seguro de desactivar este usuario? El usuario no podrá iniciar sesión, pero sus datos se conservarán.')) return;

    try {
        const { error } = await supabaseClient
            .from('perfiles')
            .update({ activo: false })
            .eq('id', id);

        if (error) throw error;

        alert('Usuario desactivado correctamente.');
        loadUsers();

    } catch (error) {
        console.error('Error desactivando usuario:', error);
        alert('Error al desactivar: ' + error.message);
    }
}

// Reactivar usuario
async function reactivateUser(id) {
    if (!confirm('¿Deseas reactivar este usuario?')) return;

    try {
        const { error } = await supabaseClient
            .from('perfiles')
            .update({ activo: true })
            .eq('id', id);

        if (error) throw error;

        alert('Usuario reactivado correctamente.');
        loadUsers();

    } catch (error) {
        console.error('Error reactivando usuario:', error);
        alert('Error al reactivar: ' + error.message);
    }
}

// Expose functions to window
window.loadUsers = loadUsers;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.reactivateUser = reactivateUser;
