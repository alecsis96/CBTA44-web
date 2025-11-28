-- ==========================================
-- PASO 1: VERIFICAR QUE LOS USUARIOS EXISTEN
-- ==========================================

-- Ver usuarios en auth.users
SELECT id, email FROM auth.users ORDER BY email;

-- ==========================================
-- PASO 2: VER EL CONSTRAINT ACTUAL
-- ==========================================

-- Mostrar información del constraint problemático
SELECT 
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  nsp.nspname AS schema_name,
  rel.relname AS table_name,
  att.attname AS column_name,
  fnsp.nspname AS foreign_schema,
  frel.relname AS foreign_table,
  fatt.attname AS foreign_column
FROM pg_constraint con
JOIN pg_class rel ON con.conrelid = rel.oid
JOIN pg_namespace nsp ON rel.relnamespace = nsp.oid
JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
LEFT JOIN pg_class frel ON con.confrelid = frel.oid
LEFT JOIN pg_namespace fnsp ON frel.relnamespace = fnsp.oid
LEFT JOIN pg_attribute fatt ON fatt.attrelid = frel.oid AND fatt.attnum = ANY(con.confkey)
WHERE rel.relname = 'perfiles' AND nsp.nspname = 'public' AND con.contype = 'f';
