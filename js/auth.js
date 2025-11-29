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
        this.initPromise = this.init();
        this.loadingProfilePromise = null;
        this.loadingProfileId = null;
    }

    async waitForInit() {
        return this.initPromise;
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

    async loadUserProfile(userId, userObject = null) {
        // 1. Intentar cargar desde caché local primero (Optimización de velocidad)
        const cachedProfile = this._loadProfileFromCache(userId);
        if (cachedProfile) {
            console.log('⚡ Perfil cargado desde caché local (Rápido)');
            this.currentUser = cachedProfile;

            // Opcional: Actualizar en segundo plano si hay conexión
            this._internalLoadUserProfile(userId, userObject).then(updated => {
                if (updated) this._saveProfileToCache(updated);
            });

            return this.currentUser;
        }

        // Deduplicación de llamadas
        if (this.loadingProfilePromise && this.loadingProfileId === userId) {
            console.log('⚠️ loadUserProfile ya está en progreso para este usuario. Esperando...');
            return this.loadingProfilePromise;
        }

        this.loadingProfileId = userId;
        this.loadingProfilePromise = this._internalLoadUserProfile(userId, userObject)
            .then(profile => {
                if (profile) this._saveProfileToCache(profile);
                return profile;
            })
            .finally(() => {
                this.loadingProfilePromise = null;
                this.loadingProfileId = null;
            });

        return this.loadingProfilePromise;
    }

    // Métodos de Caché
    _saveProfileToCache(profile) {
        try {
            localStorage.setItem('cbta_user_profile', JSON.stringify(profile));
        } catch (e) {
            console.warn('No se pudo guardar en caché:', e);
        }
    }

    _loadProfileFromCache(userId) {
        try {
            const data = localStorage.getItem('cbta_user_profile');
            if (!data) return null;

            const profile = JSON.parse(data);
            if (profile.id !== userId) return null; // El caché es de otro usuario

            return profile;
        } catch (e) {
            return null;
        }
    }

    async _internalLoadUserProfile(userId, userObject = null) {
        try {
            console.log('🔍 Buscando perfil para usuario:', userId);

            // Timeout wrapper para la consulta
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout esperando respuesta de Supabase')), 5000)
            );

            // Cargar perfil básico del usuario
            console.log('⏳ Enviando consulta a Supabase (perfiles)...');

            let result;
            try {
                result = await Promise.race([
                    this.supabase.from('perfiles').select('*').eq('id', userId).single(),
                    timeoutPromise
                ]);
            } catch (err) {
                console.error('🔴 Error o Timeout en consulta:', err);
                // Si es timeout, asumimos que algo va mal o no existe, intentamos crear
                if (err.message.includes('Timeout')) {
                    console.log('⚠️ Timeout detectado. Intentando forzar creación de perfil...');
                    const success = await this.createProfileFromAuth(userId, userObject);
                    if (success) {
                        return await this._setUserFromAuthData(userId, userObject);
                    }
                }
                throw err;
            }

            const { data: perfil, error } = result;
            console.log('📥 Respuesta recibida de Supabase:', { perfil, error });

            if (error && error.code !== 'PGRST116') { // PGRST116 es "Row not found"
                console.error('Error cargando perfil:', error);
                return null;
            }

            if (!perfil) {
                console.log('🟠 Perfil no encontrado. Intentando crearlo automáticamente...');
                const success = await this.createProfileFromAuth(userId, userObject);
                if (success) {
                    return await this._setUserFromAuthData(userId, userObject);
                }
                return null;
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

            // Agregar datos específicos según el rol (Fire and forget para no bloquear login)
            this._loadRoleSpecificData(perfil.rol, userId);

            console.log('✅ Usuario cargado:', this.currentUser);
            return this.currentUser;

        } catch (error) {
            console.error('Error en loadUserProfile:', error);
            return null;
        }
    }

    async _setUserFromAuthData(userId, userObject = null) {
        try {
            let user = userObject;
            // Si no, intentamos obtenerlo (aunque podría fallar si hay timeout)
            if (!user) {
                const { data } = await this.supabase.auth.getUser();
                user = data.user;
            }

            if (user) {
                const meta = user.user_metadata || {};
                this.currentUser = {
                    id: userId,
                    email: user.email,
                    name: meta.full_name,
                    rol: meta.role || 'alumno',
                    telefono: null,
                    avatar_url: null
                };
                // Guardar en caché para la próxima
                this._saveProfileToCache(this.currentUser);
                return this.currentUser;
            }
            return null;
        } catch (e) {
            console.error('Error construyendo usuario desde Auth:', e);
            return null;
        }
    }

    async _loadRoleSpecificData(rol, userId) {
        // Carga datos extra en segundo plano sin bloquear el login principal
        try {
            if (rol === 'alumno') {
                const { data: alumno } = await this.supabase.from('alumnos').select('*').eq('id', userId).single();
                if (alumno && this.currentUser) {
                    this.currentUser.matricula = alumno.matricula;
                    this.currentUser.grado = alumno.grado;
                    this.currentUser.grupo = alumno.grupo;
                    this.currentUser.promedio_general = alumno.promedio_general;
                }
            } else if (rol === 'docente') {
                const { data: docente } = await this.supabase.from('docentes').select('*').eq('id', userId).single();
                if (docente && this.currentUser) {
                    this.currentUser.numero_empleado = docente.numero_empleado;
                }
            }
        } catch (e) {
            console.warn('No se pudieron cargar datos específicos del rol (no crítico):', e);
        }
    }

    async createProfileFromAuth(userId, userObject = null) {
        try {
            console.log('🔵 Creando perfil desde datos de Auth...');

            let user = userObject;

            // Si no nos pasaron el usuario, intentamos obtenerlo (con riesgo de timeout)
            if (!user) {
                const userPromise = this.supabase.auth.getUser();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout getUser')), 5000));

                try {
                    const userResult = await Promise.race([userPromise, timeoutPromise]);
                    user = userResult.data.user;
                } catch (e) {
                    console.error('🔴 Timeout obteniendo usuario de Auth');
                    return null;
                }
            }

            if (!user) {
                console.error('Error: No se pudo obtener usuario de Auth para crear perfil');
                return null;
            }

            console.log('🔵 Usuario Auth obtenido:', user.email);

            const meta = user.user_metadata || {};
            const role = meta.role || 'alumno';

            // 2. Intentar insertar en perfiles (No bloqueante / Con Timeout)
            console.log('⏳ Intentando insertar en perfiles...');

            const insertProfilePromise = this.supabase
                .from('perfiles')
                .insert([{
                    id: userId,
                    email: user.email,
                    nombre_completo: meta.full_name || user.email,
                    rol: role
                }]);

            try {
                // Esperamos máximo 3 segundos para la inserción
                const { error: insertError } = await Promise.race([
                    insertProfilePromise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout Insert Perfil')), 3000))
                ]);

                if (insertError) {
                    console.error('🟠 Error creando perfil en DB (No fatal):', insertError);
                } else {
                    console.log('🟢 Perfil creado exitosamente en DB');
                }
            } catch (e) {
                console.error('🟠 Timeout o error insertando perfil (Continuando login en memoria):', e);
            }

            // 3. Crear registro específico (Upsert para evitar conflictos)
            if (role === 'alumno') {
                this.supabase.from('alumnos').upsert([{ id: userId }], { onConflict: 'id', ignoreDuplicates: true }).then(({ error }) => {
                    if (error) console.error('Error insertando alumno:', error);
                });
            } else if (role === 'docente') {
                this.supabase.from('docentes').upsert([{ id: userId }], { onConflict: 'id', ignoreDuplicates: true }).then(({ error }) => {
                    if (error) console.error('Error insertando docente:', error);
                });
            }

            // Retornamos true para indicar que "tenemos los datos suficientes para seguir"
            return true;

        } catch (err) {
            console.error('Error en createProfileFromAuth:', err);
            return null;
        }
    }

    async loginWithEmail(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw new Error(error.message);

            // Pasamos el objeto usuario directamente para evitar otra llamada a getUser()
            await this.loadUserProfile(data.user.id, data.user);

            if (!this.currentUser) {
                throw new Error('No se pudo cargar el perfil del usuario. Por favor intente nuevamente.');
            }

            return this.currentUser;

        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    async register(userData) {
        console.log('🔵 AuthManager.register called for:', userData.email);
        try {
            // 1. Crear usuario en Auth
            const { data: authData, error: authError } = await this.supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        full_name: userData.name,
                        role: userData.role
                    }
                }
            });

            if (authError) throw new Error(authError.message);
            console.log('🟢 Supabase signUp success');

            // Si no hay sesión (requiere confirmación), terminamos aquí
            if (!authData.session) {
                console.log('🟠 Requiere confirmación de email. Saltando creación de perfil en DB.');
                return {
                    user: authData.user,
                    session: null,
                    emailConfirmationRequired: true
                };
            }

            // Si hay sesión, intentamos cargar el perfil (lo creará si no existe)
            // Pasamos el usuario directamente
            await this.loadUserProfile(authData.user.id, authData.user);

            return {
                user: authData.user,
                session: authData.session,
                userProfile: this.currentUser,
                emailConfirmationRequired: false
            };

        } catch (error) {
            console.error('🔴 Error en registro:', error);
            throw error;
        }
    }

    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();

            if (error) {
                console.error('Error en logout:', error);
            }

            // Limpiar caché
            localStorage.removeItem('cbta_user_profile');

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
            this.redirectToLogin();
            return false;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(this.currentUser.rol)) {
            alert('No tienes permiso para acceder a esta página');
            this.redirectToDashboard();
            return false;
        }

        return true;
    }

    redirectToLogin() {
        // Si ya estamos en login, no hacer nada
        if (window.location.pathname.includes('/pages/login.html')) {
            return;
        }
        window.location.href = '../../pages/login.html';
    }

    redirectToDashboard() {
        if (!this.currentUser) {
            this.redirectToLogin();
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
            this.redirectToLogin();
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
            // Actualizar caché
            this._saveProfileToCache(this.currentUser);

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