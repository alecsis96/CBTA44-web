-- ==========================================
-- VERIFICAR USUARIOS EN AUTH
-- ==========================================

-- Primero, verificar qué usuarios existen en auth.users
SELECT id, email FROM auth.users ORDER BY created_at;

-- Este query mostrará los UUIDs reales de los usuarios creados
