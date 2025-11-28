-- ==========================================
-- CBTA #44 - Datos de Prueba (Seed Data)
-- ==========================================

-- IMPORTANTE: Ejecutar este script DESPUÉS de crear el schema
-- Y DESPUÉS de crear los usuarios en Supabase Auth

-- ==========================================
-- INSTRUCCIONES PARA CREAR USUARIOS
-- ==========================================

-- 1. Ve a Authentication → Users en tu dashboard de Supabase
-- 2. Crea estos 4 usuarios manualmente:

/*
  Usuario 1 - Admin:
  - Email: admin@cbta44.edu.mx
  - Password: Admin123!
  - Copiar el UUID generado

  Usuario 2 - Docente:
  - Email: docente@cbta44.edu.mx  
  - Password: Docente123!
  - Copiar el UUID generado

  Usuario 3 - Alumno:
  - Email: alumno@cbta44.edu.mx
  - Password: Alumno123!
  - Copiar el UUID generado

  Usuario 4 - Padre:
  - Email: padre@cbta44.edu.mx
  - Password: Padre123!
  - Copiar el UUID generado
*/

-- ==========================================
-- REEMPLAZAR LOS UUIDs CON LOS REALES
-- ==========================================

-- Variables temporales (REEMPLAZAR con los UUIDs reales de Supabase Auth)
-- Puedes verlos en Authentication → Users → copiar el ID de cada usuario

-- Ejemplo: 
-- \set admin_uuid '12345678-1234-1234-1234-123456789012'

-- ==========================================
-- INSERTAR PERFILES
-- ==========================================

-- Admin (REEMPLAZA '9b241d72-d7bf-4001-ad06-a89a4802e1a6' con el UUID real)
INSERT INTO public.perfiles (id, rol, nombre_completo, email, telefono, activo) VALUES
  ('9b241d72-d7bf-4001-ad06-a89a4802e1a6', 'admin', 'Administrador General', 'admin@cbta44.edu.mx', '1234567890', true)
ON CONFLICT (id) DO NOTHING;

-- Docente (REEMPLAZA 'd04fcd31-8d82-4f31-a71b-acb318e0b1f2' con el UUID real)
INSERT INTO public.perfiles (id, rol, nombre_completo, email, telefono, activo) VALUES
  ('d04fcd31-8d82-4f31-a71b-acb318e0b1f2', 'docente', 'Prof. Juan Pérez García', 'docente@cbta44.edu.mx', '1234567891', true)
ON CONFLICT (id) DO NOTHING;

-- Alumno (REEMPLAZA '4d98d309-f9be-4d14-a479-0af33e89c27e' con el UUID real)
INSERT INTO public.perfiles (id, rol, nombre_completo, email, telefono, activo) VALUES
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 'alumno', 'María Fernanda González López', 'alumno@cbta44.edu.mx', '1234567892', true)
ON CONFLICT (id) DO NOTHING;

-- Padre (REEMPLAZA '730260a3-f7bc-48a1-b25d-1bf17ed12eeb' con el UUID real)
INSERT INTO public.perfiles (id, rol, nombre_completo, email, telefono, activo) VALUES
  ('730260a3-f7bc-48a1-b25d-1bf17ed12eeb', 'padre', 'Roberto González Martínez', 'padre@cbta44.edu.mx', '1234567893', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- INSERTAR DOCENTE
-- ==========================================

INSERT INTO public.docentes (id, numero_empleado, especialidad_id, fecha_ingreso) VALUES
  ('d04fcd31-8d82-4f31-a71b-acb318e0b1f2', 'DOC001', 1, '2020-01-15')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- INSERTAR ALUMNO
-- ==========================================

INSERT INTO public.alumnos (id, matricula, especialidad_id, grado, grupo, fecha_ingreso, padre_id, promedio_general) VALUES
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', '202301001', 1, 5, 'A', '2023-08-15', '730260a3-f7bc-48a1-b25d-1bf17ed12eeb', 9.5)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- INSERTAR GRUPO
-- ==========================================

INSERT INTO public.grupos (nombre, grado, grupo, especialidad_id, ciclo_escolar, docente_guia_id, activo) VALUES
  ('5° A Programación', 5, 'A', 1, '2024-1', 'd04fcd31-8d82-4f31-a71b-acb318e0b1f2', true)
ON CONFLICT DO NOTHING;

-- Obtener el ID del grupo recién creado (normalmente será 1)
-- Si es el primer grupo, el ID será 1

-- ==========================================
-- ASIGNAR MATERIAS AL GRUPO
-- ==========================================

INSERT INTO public.grupos_materias (grupo_id, materia_id, docente_id) VALUES
  (1, 1, 'd04fcd31-8d82-4f31-a71b-acb318e0b1f2'),  -- POO
  (1, 2, 'd04fcd31-8d82-4f31-a71b-acb318e0b1f2'),  -- Bases de Datos
  (1, 3, 'd04fcd31-8d82-4f31-a71b-acb318e0b1f2'),  -- Desarrollo Web
  (1, 4, 'd04fcd31-8d82-4f31-a71b-acb318e0b1f2')   -- Matemáticas
ON CONFLICT DO NOTHING;

-- ==========================================
-- INSERTAR CALIFICACIONES
-- ==========================================

INSERT INTO public.calificaciones (alumno_id, materia_id, parcial, calificacion, ciclo_escolar, observaciones) VALUES
  -- Programación Orientada a Objetos
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, 1, 9.5, '2024-1', 'Excelente comprensión de conceptos'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, 2, 9.8, '2024-1', 'Proyecto destacado'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, 3, 9.3, '2024-1', NULL),
  
  -- Bases de Datos
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 2, 1, 9.0, '2024-1', NULL),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 2, 2, 9.5, '2024-1', 'Muy buena participación'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 2, 3, 9.7, '2024-1', 'Excelente examen final'),
  
  -- Desarrollo Web
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 3, 1, 10.0, '2024-1', 'Proyecto sobresaliente'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 3, 2, 9.5, '2024-1', NULL),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 3, 3, 9.8, '2024-1', NULL),
  
  -- Matemáticas Aplicadas
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 4, 1, 9.2, '2024-1', NULL),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 4, 2, 9.0, '2024-1', NULL),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 4, 3, 9.5, '2024-1', 'Mejoró notablemente')
ON CONFLICT DO NOTHING;

-- ==========================================
-- INSERTAR ASISTENCIAS (Últimos 10 días)
-- ==========================================

INSERT INTO public.asistencias (alumno_id, materia_id, fecha, estado) VALUES
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, CURRENT_DATE - INTERVAL '9 days', 'presente'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, CURRENT_DATE - INTERVAL '8 days', 'presente'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, CURRENT_DATE - INTERVAL '7 days', 'presente'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, CURRENT_DATE - INTERVAL '6 days', 'presente'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, CURRENT_DATE - INTERVAL '5 days', 'retardo'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, CURRENT_DATE - INTERVAL '4 days', 'presente'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, CURRENT_DATE - INTERVAL '3 days', 'presente'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, CURRENT_DATE - INTERVAL '2 days', 'presente'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, CURRENT_DATE - INTERVAL '1 day', 'presente'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, CURRENT_DATE, 'presente')
ON CONFLICT DO NOTHING;

-- ==========================================
-- VERIFICAR DATOS INSERTADOS
-- ==========================================

SELECT 
  'Perfiles' as tabla, 
  COUNT(*) as registros 
FROM public.perfiles
UNION ALL
SELECT 'Especialidades', COUNT(*) FROM public.especialidades
UNION ALL
SELECT 'Materias', COUNT(*) FROM public.materias
UNION ALL
SELECT 'Alumnos', COUNT(*) FROM public.alumnos
UNION ALL
SELECT 'Docentes', COUNT(*) FROM public.docentes
UNION ALL
SELECT 'Grupos', COUNT(*) FROM public.grupos
UNION ALL
SELECT 'Calificaciones', COUNT(*) FROM public.calificaciones
UNION ALL
SELECT 'Asistencias', COUNT(*) FROM public.asistencias;

-- ==========================================
-- ¡LISTO!
-- ==========================================

SELECT '✅ Datos de prueba insertados correctamente' AS resultado;
SELECT '⚠️ RECUERDA: Reemplazar todos los UUID_*_AQUI con los IDs reales de Supabase Auth' AS importante;
