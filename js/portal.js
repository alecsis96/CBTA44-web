/**
 * CBTA #44 - Funcionalidad Portal de Gestión
 */

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

// ===== DATOS DE DEMOSTRACIÓN =====

// Alumnos de ejemplo
const DEMO_STUDENTS = [
    { id: 1, matricula: '202301001', nombre: 'María Fernanda', apellidos: 'González López', grado: '5', grupo: 'A', especialidad: 'Programación', promedio: 9.5 },
    { id: 2, matricula: '202301002', nombre: 'Juan Carlos', apellidos: 'Martínez Pérez', grado: '5', grupo: 'A', especialidad: 'Programación', promedio: 8.7 },
    { id: 3, matricula: '202301003', nombre: 'Ana Sofía', apellidos: 'Rodríguez García', grado: '5', grupo: 'B', especialidad: 'Administración', promedio: 9.2 },
    { id: 4, matricula: '202301004', nombre: 'Luis Alberto', apellidos: 'Hernández Cruz', grado: '4', grupo: 'A', especialidad: 'Electrónica', promedio: 8.9 },
    { id: 5, matricula: '202301005', nombre: 'Carmen Elena', apellidos: 'López Sánchez', grado: '4', grupo: 'B', especialidad: 'Contabilidad', promedio: 9.0 }
];

// Materias de ejemplo
const DEMO_SUBJECTS = [
    { id: 1, nombre: 'Programación Orientada a Objetos', grado: '5', especialidad: 'Programación' },
    { id: 2, nombre: 'Bases de Datos', grado: '5', especialidad: 'Programación' },
    { id: 3, nombre: 'Desarrollo Web', grado: '5', especialidad: 'Programación' },
    { id: 4, nombre: 'Matemáticas Aplicadas', grado: '5', especialidad: 'Todas' },
    { id: 5, nombre: 'Administración de Empresas', grado: '5', especialidad: 'Administración' }
];

// Calificaciones de ejemplo
const DEMO_GRADES = {
    '202301001': {
        'Programación Orientada a Objetos': { parcial1: 9.5, parcial2: 9.8, parcial3: 9.3 },
        'Bases de Datos': { parcial1: 9.0, parcial2: 9.5, parcial3: 9.7 },
        'Desarrollo Web': { parcial1: 10.0, parcial2: 9.5, parcial3: 9.8 },
        'Matemáticas Aplicadas': { parcial1: 9.2, parcial2: 9.0, parcial3: 9.5 }
    },
    '202301002': {
        'Programación Orientada a Objetos': { parcial1: 8.5, parcial2: 8.8, parcial3: 8.9 },
        'Bases de Datos': { parcial1: 8.0, parcial2: 9.0, parcial3: 8.7 },
        'Desarrollo Web': { parcial1: 9.0, parcial2: 8.5, parcial3: 8.8 },
        'Matemáticas Aplicadas': { parcial1: 8.2, parcial2: 8.5, parcial3: 9.0 }
    }
};

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Obtiene alumnos por filtros
 */
function getStudents(filters = {}) {
    let students = [...DEMO_STUDENTS];

    if (filters.grado) {
        students = students.filter(s => s.grado === filters.grado);
    }

    if (filters.grupo) {
        students = students.filter(s => s.grupo === filters.grupo);
    }

    if (filters.especialidad) {
        students = students.filter(s => s.especialidad === filters.especialidad);
    }

    return students;
}

/**
 * Obtiene calificaciones de un alumno
 */
function getGrades(matricula) {
    return DEMO_GRADES[matricula] || {};
}

/**
 * Calcula el promedio de calificaciones
 */
function calculateAverage(grades) {
    if (!grades || Object.keys(grades).length === 0) return 0;

    const allGrades = [];
    Object.values(grades).forEach(subject => {
        Object.values(subject).forEach(grade => {
            allGrades.push(grade);
        });
    });

    return window.CBTA44Utils.calculateAverage(allGrades);
}

/**
 * Renderiza una tabla de alumnos
 */
function renderStudentsTable(students, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (students.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><h3>No hay alumnos para mostrar</h3></div>';
        return;
    }

    const html = `
    <table>
      <thead>
        <tr>
          <th>Matrícula</th>
          <th>Nombre</th>
          <th>Grado</th>
          <th>Grupo</th>
          <th>Especialidad</th>
          <th>Promedio</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${students.map(student => `
          <tr>
            <td><strong>${student.matricula}</strong></td>
            <td>${student.nombre} ${student.apellidos}</td>
            <td>${student.grado}°</td>
            <td>${student.grupo}</td>
            <td>${student.especialidad}</td>
            <td><span class="badge badge-${student.promedio >= 9 ? 'success' : student.promedio >= 8 ? 'primary' : 'warning'}">${student.promedio}</span></td>
            <td>
              <button class="btn btn-ghost btn-sm" onclick="viewStudent(${student.id})">Ver</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

    container.innerHTML = html;
}

/**
 * Renderiza tabla de calificaciones
 */
function renderGradesTable(matricula, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const grades = getGrades(matricula);

    if (Object.keys(grades).length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><h3>No hay calificaciones disponibles</h3></div>';
        return;
    }

    const html = `
    <table>
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
        ${Object.entries(grades).map(([subject, parciales]) => {
        const avg = ((parciales.parcial1 + parciales.parcial2 + parciales.parcial3) / 3).toFixed(2);
        return `
            <tr>
              <td><strong>${subject}</strong></td>
              <td>${parciales.parcial1}</td>
              <td>${parciales.parcial2}</td>
              <td>${parciales.parcial3}</td>
              <td><span class="badge badge-${avg >= 9 ? 'success' : avg >= 8 ? 'primary' : 'warning'}">${avg}</span></td>
            </tr>
          `;
    }).join('')}
      </tbody>
    </table>
  `;

    container.innerHTML = html;
}

/**
 * Vista de alumno (para demostración)
 */
function viewStudent(id) {
    const student = DEMO_STUDENTS.find(s => s.id === id);
    if (student) {
        alert(`Viendo perfil de: ${student.nombre} ${student.apellidos}\nMatrícula: ${student.matricula}`);
    }
}

// ===== EXPORTAR PARA USO GLOBAL =====
window.PortalUtils = {
    getStudents,
    getGrades,
    calculateAverage,
    renderStudentsTable,
    renderGradesTable,
    DEMO_STUDENTS,
    DEMO_SUBJECTS,
    DEMO_GRADES
};
