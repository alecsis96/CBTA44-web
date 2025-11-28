-- Verificar que los datos de perfiles están en la base de datos
SELECT * FROM public.perfiles;

-- Verificar alumnos
SELECT * FROM public.alumnos;

-- Verificar docentes  
SELECT * FROM public.docentes;

-- Contar registros por tabla
SELECT 'perfiles' as tabla, COUNT(*) as total FROM public.perfiles
UNION ALL SELECT 'alumnos', COUNT(*) FROM public.alumnos
UNION ALL SELECT 'docentes', COUNT(*) FROM public.docentes
UNION ALL SELECT 'grupos', COUNT(*) FROM public.grupos
UNION ALL SELECT 'calificaciones', COUNT(*) FROM public.calificaciones;
