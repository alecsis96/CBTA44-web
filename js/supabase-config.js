/**
 * CBTA #44 - Configuración de Supabase
 * 
 * IMPORTANTE: Este archivo contiene las credenciales públicas de Supabase.
 * La anon key es segura para usar en el cliente (navegador).
 */

// Credenciales del proyecto Supabase
// Credenciales del proyecto Supabase
if (typeof SUPABASE_URL === 'undefined') {
    var SUPABASE_URL = 'https://uatqudtzuvkhxdtvrjsc.supabase.co';
}

// Anon/Public Key - Segura para usar en el cliente
if (typeof SUPABASE_ANON_KEY === 'undefined') {
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdHF1ZHR6dXZraHhkdHZyanNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMDI5MTAsImV4cCI6MjA3OTc3ODkxMH0.fbOCsvenOaX_uDzz1p-mLyKuS49hosWmHjHybbLaYDo';
}

// Verificar que Supabase SDK esté disponible
if (typeof window !== 'undefined' && typeof window.supabase === 'undefined') {
    console.warn('⚠️ SDK de Supabase no detectado. Asegúrate de incluir: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
}

// Inicializar el cliente de Supabase
let supabaseClient = null;

// Función para inicializar Supabase
function initSupabase() {
    if (typeof window === 'undefined' || typeof window.supabase === 'undefined') {
        console.error('❌ SDK de Supabase no cargado. Asegúrate de incluir el script en tu HTML.');
        return null;
    }

    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Cliente de Supabase inicializado correctamente');
        return supabaseClient;
    } catch (error) {
        console.error('❌ Error al inicializar Supabase:', error);
        return null;
    }
}

// Auto-inicializar cuando se carga el script
const supabase = initSupabase();

// Exportar para uso global
window.supabaseClient = supabase;
