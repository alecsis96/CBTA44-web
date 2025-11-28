-- ==========================================
-- SOLUCIÓN COMPLETA DEL PROBLEMA DE FK
-- ==========================================

-- PASO 1: Ver todos los constraints actuales en perfiles
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_schema AS foreign_schema,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints AS tc 
LEFT JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'perfiles' 
  AND tc.table_schema = 'public';

-- PASO 2: Eliminar TODOS los foreign key constraints en perfiles
ALTER TABLE public.perfiles DROP CONSTRAINT IF EXISTS perfiles_id_fkey CASCADE;
ALTER TABLE public.perfiles DROP CONSTRAINT IF EXISTS perfiles_user_id_fkey CASCADE;
ALTER TABLE public.perfiles DROP CONSTRAINT IF EXISTS fk_perfiles_users CASCADE;

-- PASO 3: Agregar el constraint CORRECTO apuntando a auth.users
ALTER TABLE public.perfiles 
  ADD CONSTRAINT perfiles_id_fkey 
  FOREIGN KEY (id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- PASO 4: Verificar que el constraint esté correcto
SELECT 
  tc.constraint_name, 
  kcu.column_name,
  ccu.table_schema AS foreign_schema,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'perfiles' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';

SELECT '✅ Constraint arreglado correctamente' AS resultado;
