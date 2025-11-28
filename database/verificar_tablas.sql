-- Verificar si existe una tabla "users" en el esquema public
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'users';

-- Ver todas las tablas del esquema public
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
