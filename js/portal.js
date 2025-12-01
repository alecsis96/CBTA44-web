/**
 * CBTA #44 - Funcionalidad Portal de Gestión (ES Module)
 */

import { supabaseClient } from './supabase-config.js';
import { authManager } from './auth.js';

// ===== SIDEBAR TOGGLE (MOBILE) =====
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (sidebarToggle && sidebar && sidebarOverlay) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
  });

  sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  });
}

// ===== LÓGICA DOCENTE (REAL) =====

/**
 * Carga los grupos asignados al docente
 * @param {string} docenteId - ID del docente (UUID)
 */
export async function loadTeacherGroups(docenteId) {
  console.log('📚 Cargando grupos para docente:', docenteId);
  const container = document.getElementById('groupsContainer');

  if (container) {
    container.innerHTML = '<p class="text-center">Cargando grupos...</p>';
  }

  try {
    const { data: groups, error } = await supabaseClient
      .from('grupos_materias')
      .select('*')
      .eq('docente_id', docenteId);

    if (error) throw error;

    console.log('✅ Grupos cargados:', groups);
    renderGroupsCards(groups);

    // Si hay grupos, cargar alumnos del primero por defecto
    if (groups.length > 0) {
      loadGroupStudents(groups[0]);
    } else {
      if (container) container.innerHTML = '<p class="text-center">No tienes grupos asignados.</p>';
      renderStudentsTable([], 'studentsTable');
    }

    return groups;

  } catch (error) {
    console.error('🔴 Error cargando grupos:', error);
    if (container) container.innerHTML = '<p class="text-center text-error">Error al cargar grupos.</p>';
    return [];
  }
}

/**
 * Carga los alumnos de un grupo específico
 * @param {Object} groupData - Objeto con { grado, grupo, materia }
 */
export async function loadGroupStudents(groupData) {
  console.log('👥 Cargando alumnos para:', groupData.grado, groupData.grupo);
  const containerId = 'studentsTable';
  const container = document.getElementById(containerId);

  if (container) {
    container.innerHTML = '<p class="text-center">Cargando alumnos...</p>';
    // Actualizar título de la tabla si existe
    const tableTitle = document.getElementById('tableTitle');
    if (tableTitle) tableTitle.textContent = `Alumnos ${groupData.grado}° ${groupData.grupo} - ${groupData.materia}`;
  }

  try {
    // Nota: Ajustar la consulta según la relación real en Supabase
    const { data: students, error } = await supabaseClient
      .from('alumnos')
      .select(`
                *,
                perfiles:id (nombre_completo, email, avatar_url)
            `)
      .eq('grado', groupData.grado)
      .eq('grupo', groupData.grupo);

    if (error) throw error;

    console.log('✅ Alumnos cargados:', students);

    // Mapear datos para facilitar el renderizado
    const formattedStudents = students.map(s => ({
      id: s.id,
      matricula: s.matricula || 'S/N',
      nombre_completo: s.perfiles?.nombre_completo || 'Desconocido',
      grado: s.grado,
      grupo: s.grupo,
      promedio: s.promedio_general || 0,
      email: s.perfiles?.email
    }));

    renderStudentsTable(formattedStudents, containerId);

  } catch (error) {
    console.error('🔴 Error cargando alumnos:', error);
    if (container) container.innerHTML = '<p class="text-center text-error">Error al cargar alumnos.</p>';
  }
}

/**
 * Renderiza las tarjetas de grupos
 */
function renderGroupsCards(groups) {
  const container = document.getElementById('groupsContainer');
  if (!container) return;

  if (groups.length === 0) {
    container.innerHTML = '<p>No hay grupos asignados.</p>';
    return;
  }

  // Exponer función para onclick
  window.loadGroupStudentsGlobal = loadGroupStudents;

  container.innerHTML = groups.map(group => `
        <div class="card clickable-card" onclick='window.loadGroupStudentsGlobal(${JSON.stringify(group)})'>
            <div class="card-body">
                <h3 style="margin-bottom: var(--spacing-md); font-size: var(--font-size-lg);">
                    ${group.grado}° ${group.grupo} - ${group.materia}
                </h3>
                <p style="color: var(--color-gray-600); margin-bottom: var(--spacing-md);">
                    Ver Alumnos
                </p>
                <button class="btn btn-ghost btn-sm" style="width: 100%;">Seleccionar</button>
            </div>
        </div>
    `).join('');
}

/**
 * Renderiza la tabla de alumnos
 */
export function renderStudentsTable(students, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (students.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><h3>No hay alumnos en este grupo</h3></div>';
    return;
  }

  const html = `
    <div style="overflow-x: auto;">
        <table class="portal-table">
        <thead>
            <tr>
            <th>Matrícula</th>
            <th>Nombre</th>
            <th>Grado/Grupo</th>
            <th>Promedio</th>
            <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            ${students.map(student => `
            <tr>
                <td><strong>${student.matricula}</strong></td>
                <td>
                    <div style="display: flex; flex-direction: column;">
                        <span>${student.nombre_completo}</span>
                        <small style="color: var(--color-gray-500);">${student.email || ''}</small>
                    </div>
                </td>
                <td>${student.grado}° ${student.grupo}</td>
                <td>
                    <span class="badge badge-${student.promedio >= 9 ? 'success' : student.promedio >= 8 ? 'primary' : 'warning'}">
                        ${student.promedio}
                    </span>
                </td>
                <td>
                <button class="btn btn-ghost btn-sm" onclick="alert('Ver perfil de ${student.id}')">Ver</button>
                </td>
            </tr>
            `).join('')}
        </tbody>
        </table>
    </div>
    `;

  container.innerHTML = html;
}

/**
 * Renderiza la tabla de calificaciones (Alumno)
 * @param {string} matricula - Matrícula del alumno
 * @param {string} containerId - ID del contenedor
 */
export function renderGradesTable(matricula, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Datos simulados por ahora
  const grades = [
    { materia: 'Matemáticas V', parcial1: 9, parcial2: 8, parcial3: 9, final: 8.6 },
    { materia: 'Física II', parcial1: 8, parcial2: 8, parcial3: 8, final: 8.0 },
    { materia: 'Programación Web', parcial1: 10, parcial2: 10, parcial3: 9, final: 9.6 },
    { materia: 'Inglés V', parcial1: 9, parcial2: 9, parcial3: 10, final: 9.3 },
    { materia: 'Ciencia, Tecnología, Sociedad y Valores', parcial1: 9, parcial2: 8, parcial3: 9, final: 8.6 }
  ];

  if (grades.length === 0) {
    container.innerHTML = '<div class="empty-state"><h3>No hay calificaciones registradas</h3></div>';
    return;
  }

  const html = `
    <div style="overflow-x: auto;">
      <table class="portal-table">
        <thead>
          <tr>
            <th>Materia</th>
            <th>Parcial 1</th>
            <th>Parcial 2</th>
            <th>Parcial 3</th>
            <th>Promedio</th>
          </tr>
        </thead>
        <tbody>
          ${grades.map(g => `
            <tr>
                <td><strong>${g.materia}</strong></td>
                <td>${g.parcial1}</td>
                <td>${g.parcial2}</td>
                <td>${g.parcial3}</td>
                <td><span class="badge badge-primary">${g.final}</span></td>
            </tr>
            `).join('')}
        </tbody>
      </table>
    </div>
    `;

  container.innerHTML = html;
}
