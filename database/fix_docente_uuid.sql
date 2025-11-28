-- Corregir el UUID del docente que no coincide con Auth
-- ID en Auth (Real):   d04fcd31-8d82-4f31-a71b-acb318e0b112
-- ID en Perfiles (Seed): d04fcd31-8d82-4f31-a71b-acb318e0b1f2

-- 1. Actualizar tabla docentes (si existe el registro con el ID incorrecto)
UPDATE public.docentes
SET id = 'd04fcd31-8d82-4f31-a71b-acb318e0b112'
WHERE id = 'd04fcd31-8d82-4f31-a71b-acb318e0b1f2';

-- 2. Actualizar tabla perfiles
UPDATE public.perfiles
SET id = 'd04fcd31-8d82-4f31-a71b-acb318e0b112'
WHERE id = 'd04fcd31-8d82-4f31-a71b-acb318e0b1f2';

-- 3. Verificar que ahora sí coinciden
SELECT * FROM public.perfiles WHERE id = 'd04fcd31-8d82-4f31-a71b-acb318e0b112';
