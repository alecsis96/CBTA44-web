/**
 * CBTA #44 - Sistema de Autenticación con Supabase
 * 
 * Este archivo reemplaza el sistema de demo con autenticación real usando Supabase.
 */

// ===== CLASE AUTHMANAGER CON SUPABASE =====
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.supabase = window.supabaseClient;
        this.init();
    }

    async init() {
        try {
            // Verificar si hay una sesión activa
            const { data: { session }, error } = await this.supabase.auth.getSession();

            if (error) {
                console.error('Error obteniendo sesión:', error);
                return;
            }

            if (session) {
                await this.loadUserProfile(session.user.id);
            }

            // Escuchar cambios en la autenticación
            this.supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('Auth state changed:', event);

                if (event === 'SIGNED_IN' && session) {
                    await this.loadUserProfile(session.user.id);
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                }
            });

        } catch (error) {
            console.error('Error en init:', error);
        }
    }

    async loadUserProfile(userId) {
        try {
            console.log('🔍 Buscando perfil para usuario:', userId);

            // Cargar perfil básico del usuario
            const { data: perfil, error } = await this.supabase
                .from('perfiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error cargando perfil:', error);
                return;
            }

            if (!perfil) {
                console.error('Perfil no encontrado para el usuario:', userId);
                return;
            }

            // Estructurar datos del usuario según su rol
            this.currentUser = {
                id: perfil.id,
                email: perfil.email,
                name: perfil.nombre_completo,
                rol: perfil.rol,
                telefono: perfil.telefono,
                avatar_url: perfil.avatar_url
            };

            // Agregar datos específicos según el rol
            if (perfil.rol === 'alumno') {
                const { data: alumno } = await this.supabase
                    .from('alumnos')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (alumno) {
                    this.currentUser.matricula = alumno.matricula;
                    this.currentUser.grado = alumno.grado;
                    this.currentUser.grupo = alumno.grupo;
                    this.currentUser.promedio_general = alumno.promedio_general;
                }
            } else if (perfil.rol === 'docente') {
                const { data: docente } = await this.supabase
                    .from('docentes')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (docente) {
                    this.currentUser.numero_empleado = docente.numero_empleado;
                }
            }

            console.log('✅ Usuario cargado:', this.currentUser);
            return this.currentUser;

        } catch (error) {
            console.error('Error en loadUserProfile:', error);
            return null;
        }
    }

    async login(email, password, userType) {
        try {
            // Intentar login con Supabase Auth
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw new Error(error.message);
            }

            // Cargar perfil completo
            await this.loadUserProfile(data.user.id);

            // Verificar que el rol coincida
            if (this.currentUser.rol !== userType) {
                await this.logout();
                throw new Error('El tipo de usuario seleccionado no coincide con tu cuenta');
            }

            return this.currentUser;

        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();

            if (error) {
                console.error('Error en logout:', error);
            }

            this.currentUser = null;
            window.location.href = '../pages/login.html';

        } catch (error) {
            console.error('Error en logout:', error);
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    requireAuth(allowedRoles = []) {
        if (!this.isAuthenticated()) {
            window.location.href = '../../pages/login.html';
            return false;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(this.currentUser.rol)) {
            alert('No tienes permiso para acceder a esta página');
            this.redirectToDashboard();
            return false;
        }

        return true;
    }

    redirectToDashboard() {
        if (!this.currentUser) {
            window.location.href = '../../pages/login.html';
            return;
        }

        const dashboards = {
            'admin': '../portal/admin/dashboard.html',
            'docente': '../portal/docente/dashboard.html',
            'alumno': '../portal/alumno/dashboard.html'
        };

        const url = dashboards[this.currentUser.rol];
        console.log('🚀 Redirigiendo a:', url, 'Rol:', this.currentUser.rol);

        if (url) {
            window.location.href = url;
        } else {
            console.error('❌ Rol no válido:', this.currentUser.rol);
            window.location.href = '../../pages/login.html';
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    async updateProfile(updates) {
        if (!this.isAuthenticated()) {
            throw new Error('No autenticado');
        }

        try {
            const { data, error } = await this.supabase
                .from('perfiles')
                .update(updates)
                .eq('id', this.currentUser.id)
                .select()
                .single();

            if (error) throw error;

            // Actualizar usuario actual
            this.currentUser = { ...this.currentUser, ...updates };
            return data;

        } catch (error) {
            console.error('Error actualizando perfil:', error);
            throw error;
        }
    }
}

// ===== INSTANCIA GLOBAL =====
const authManager = new AuthManager();
window.authManager = authManager;

console.log('✅ Auth.js cargado - Sistema de autenticación con Supabase activo');