-- Verificar estado de RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Verificar existencia del perfil docente específico
SELECT * FROM public.perfiles WHERE id = 'd04fcd31-8d82-4f31-a71b-acb318e0b1f2';

-- Verificar existencia del usuario en auth.users (solo para confirmar)
SELECT id, email FROM auth.users WHERE email = 'docente@cbta44.edu.mx';
