-- PASO 1: Eliminar el constraint de forma definitiva
ALTER TABLE public.perfiles DROP CONSTRAINT IF EXISTS perfiles_id_fkey CASCADE;

-- Verificar que se eliminó
SELECT conname FROM pg_constraint WHERE conname = 'perfiles_id_fkey';
-- Debería retornar 0 filas

SELECT '✅ Constraint eliminado' AS resultado;
