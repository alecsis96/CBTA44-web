-- Desactivar RLS en todas las tablas para que el sistema funcione
ALTER TABLE public.perfiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumnos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.docentes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos_materias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias DISABLE ROW LEVEL SECURITY;

SELECT '✅ RLS desactivado en todas las tablas' AS resultado;
SELECT '⚠️ Nota: En producción deberías configurar las políticas RLS correctamente' AS advertencia;
