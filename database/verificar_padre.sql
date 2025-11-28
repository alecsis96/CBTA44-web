-- Verificar UUID del padre
SELECT id, email FROM auth.users WHERE email = 'padre@cbta44.edu.mx';

-- Verificar si existe en perfiles
SELECT * FROM public.perfiles WHERE email = 'padre@cbta44.edu.mx';

-- Verificar si hay un alumno con este padre_id
SELECT * FROM public.alumnos WHERE padre_id = '730260a3-f7bc-48a1-b25d-1bf17ed12eeb';
