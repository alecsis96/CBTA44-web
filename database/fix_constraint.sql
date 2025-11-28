-- ==========================================
-- ARREGLAR CONSTRAINT DE PERFILES
-- ==========================================

-- 1. Eliminar la constraint incorrecta
ALTER TABLE public.perfiles DROP CONSTRAINT IF EXISTS perfiles_id_fkey;

-- 2. Agregar la constraint correcta apuntando a auth.users
ALTER TABLE public.perfiles 
  ADD CONSTRAINT perfiles_id_fkey 
  FOREIGN KEY (id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- 3. Verificar que la constraint esté correcta
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'perfiles' AND tc.constraint_type = 'FOREIGN KEY';
