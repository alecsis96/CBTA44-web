-- PASO 2: Insertar datos SIN constraint
INSERT INTO public.perfiles (id, rol, nombre_completo, email, telefono, activo) VALUES
  ('9b241d72-d7bf-4001-ad06-a89a4802e1a6', 'admin', 'Administrador General', 'admin@cbta44.edu.mx', '1234567890', true),
  ('d04fcd31-8d82-4f31-a71b-acb318e0b1f2', 'docente', 'Prof. Juan Pérez García', 'docente@cbta44.edu.mx', '1234567891', true),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 'alumno', 'María Fernanda González López', 'alumno@cbta44.edu.mx', '1234567892', true),
  ('730260a3-f7bc-48a1-b25d-1bf17ed12eeb', 'padre', 'Roberto González Martínez', 'padre@cbta44.edu.mx', '1234567893', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.docentes (id, numero_empleado, especialidad_id, fecha_ingreso) VALUES
  ('d04fcd31-8d82-4f31-a71b-acb318e0b1f2', 'DOC001', 1, '2020-01-15')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.alumnos (id, matricula, especialidad_id, grado, grupo, fecha_ingreso, padre_id, promedio_general) VALUES
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', '202301001', 1, 5, 'A', '2023-08-15', '730260a3-f7bc-48a1-b25d-1bf17ed12eeb', 9.5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.grupos (nombre, grado, grupo, especialidad_id, ciclo_escolar, docente_guia_id, activo) VALUES
  ('5° A Programación', 5, 'A', 1, '2024-1', 'd04fcd31-8d82-4f31-a71b-acb318e0b1f2', true);

INSERT INTO public.grupos_materias (grupo_id, materia_id, docente_id) VALUES
  (1, 1, 'd04fcd31-8d82-4f31-a71b-acb318e0b1f2'),
  (1, 2, 'd04fcd31-8d82-4f31-a71b-acb318e0b1f2'),
  (1, 3, 'd04fcd31-8d82-4f31-a71b-acb318e0b1f2'),
  (1, 4, 'd04fcd31-8d82-4f31-a71b-acb318e0b1f2')
ON CONFLICT DO NOTHING;

INSERT INTO public.calificaciones (alumno_id, materia_id, parcial, calificacion, ciclo_escolar, observaciones) VALUES
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, 1, 9.5, '2024-1', 'Excelente comprensión de conceptos'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, 2, 9.8, '2024-1', 'Proyecto destacado'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 1, 3, 9.3, '2024-1', NULL),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 2, 1, 9.0, '2024-1', NULL),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 2, 2, 9.5, '2024-1', 'Muy buena participación'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 2, 3, 9.7, '2024-1', 'Excelente examen final'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 3, 1, 10.0, '2024-1', 'Proyecto sobresaliente'),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 3, 2, 9.5, '2024-1', NULL),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 3, 3, 9.8, '2024-1', NULL),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 4, 1, 9.2, '2024-1', NULL),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 4, 2, 9.0, '2024-1', NULL),
  ('4d98d309-f9be-4d14-a479-0af33e89c27e', 4, 3, 9.5, '2024-1', 'Mejoró notablemente')
ON CONFLICT DO NOTHING;

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

-- Verificar resultados
SELECT 'Perfiles' as tabla, COUNT(*) as registros FROM public.perfiles
UNION ALL SELECT 'Docentes', COUNT(*) FROM public.docentes
UNION ALL SELECT 'Alumnos', COUNT(*) FROM public.alumnos
UNION ALL SELECT 'Grupos', COUNT(*) FROM public.grupos
UNION ALL SELECT 'Grupos-Materias', COUNT(*) FROM public.grupos_materias
UNION ALL SELECT 'Calificaciones', COUNT(*) FROM public.calificaciones
UNION ALL SELECT 'Asistencias', COUNT(*) FROM public.asistencias;

SELECT '✅ Datos insertados correctamente (SIN FK)' AS resultado;
