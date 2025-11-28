-- Verificar UUID del admin
SELECT id, email FROM auth.users WHERE email = 'admin@cbta44.edu.mx';

-- Verificar si existe en perfiles
SELECT * FROM public.perfiles WHERE email = 'admin@cbta44.edu.mx';
