-- Ver el DDL exacto de la tabla perfiles
SELECT 
    'CREATE TABLE ' || schemaname || '.' || tablename || ' (' ||
    string_agg(column_name || ' ' || data_type, ', ') || ');' AS table_definition
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'perfiles'
GROUP BY schemaname, tablename;

-- Ver el constraint exacto
SELECT pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'perfiles_id_fkey';

-- Verificar schema del constraint
SELECT 
  nsp.nspname as schema_name,
  rel.relname as table_name,
  con.conname as constraint_name,
  fnsp.nspname as foreign_schema,
  frel.relname as foreign_table
FROM pg_constraint con
JOIN pg_class rel ON con.conrelid = rel.oid
JOIN pg_namespace nsp ON rel.relnamespace = nsp.oid
LEFT JOIN pg_class frel ON con.confrelid = frel.oid
LEFT JOIN pg_namespace fnsp ON frel.relnamespace = fnsp.oid
WHERE con.conname = 'perfiles_id_fkey';
