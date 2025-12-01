/**
 * CBTA #44 - Configuración de Supabase (ES Module)
 */

// Credenciales del proyecto Supabase
export const SUPABASE_URL = 'https://uatqudtzuvkhxdtvrjsc.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdHF1ZHR6dXZraHhkdHZyanNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMDI5MTAsImV4cCI6MjA3OTc3ODkxMH0.fbOCsvenOaX_uDzz1p-mLyKuS49hosWmHjHybbLaYDo';

// Verificar que Supabase SDK esté disponible
if (typeof window.supabase === 'undefined') {
    console.error('❌ SDK de Supabase no detectado. Asegúrate de incluir el script de Supabase antes de este módulo.');
}

// Inicializar el cliente de Supabase
let client = null;

try {
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Cliente de Supabase inicializado (ES Module)');
} catch (error) {
    console.error('❌ Error al inicializar Supabase:', error);
}

export const supabaseClient = client;
