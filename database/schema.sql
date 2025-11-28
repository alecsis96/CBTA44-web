-- ==========================================
-- CBTA #44 - Esquema de Base de Datos
-- Supabase PostgreSQL
-- ==========================================

-- IMPORTANTE: Ejecutar este script en el SQL Editor de Supabase
-- Dashboard → SQL Editor → New query → Pegar y ejecutar

-- ==========================================
-- 1. PERFILES (Extiende auth.users)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'docente', 'alumno', 'padre')),
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  avatar_url TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_perfiles_rol ON public.perfiles(rol);
CREATE INDEX IF NOT EXISTS idx_perfiles_email ON public.perfiles(email);

-- RLS (Row Level Security)
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios pueden ver su propio perfil
CREATE POLICY "usuarios_ven_propio_perfil"
  ON public.perfiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Los admins pueden ver todos los perfiles
CREATE POLICY "admins_ven_todos_perfiles"
  ON public.perfiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Policy: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "usuarios_actualizan_propio_perfil"
  ON public.perfiles FOR UPDATE
  USING (auth.uid() = id);

-- ==========================================
-- 2. ESPECIALIDADES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.especialidades (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Datos iniciales
INSERT INTO public.especialidades (nombre, descripcion) VALUES
  ('Programación', 'Técnico en Programación'),
  ('Administración', 'Técnico en Administración'),
  ('Contabilidad', 'Técnico en Contabilidad'),
  ('Electrónica', 'Técnico en Electrónica'),
  ('Mecatrónica', 'Técnico en Mecatrónica'),
  ('Informática', 'Técnico en Informática')
ON CONFLICT (nombre) DO NOTHING;

-- RLS: Todos pueden leer especialidades
ALTER TABLE public.especialidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_leen_especialidades"
  ON public.especialidades FOR SELECT
  TO authenticated
  USING (true);

-- ==========================================
-- 3. ALUMNOS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.alumnos (
  id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE PRIMARY KEY,
  matricula VARCHAR(20) NOT NULL UNIQUE,
  especialidad_id INTEGER REFERENCES public.especialidades(id),
  grado INTEGER CHECK (grado BETWEEN 1 AND 6),
  grupo VARCHAR(10),
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  padre_id UUID REFERENCES public.perfiles(id),
  promedio_general DECIMAL(4,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alumnos_matricula ON public.alumnos(matricula);
CREATE INDEX IF NOT EXISTS idx_alumnos_padre ON public.alumnos(padre_id);

-- RLS
ALTER TABLE public.alumnos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alumnos_ven_propia_info"
  ON public.alumnos FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "padres_ven_info_hijos"
  ON public.alumnos FOR SELECT
  USING (auth.uid() = padre_id);

CREATE POLICY "docentes_admins_ven_alumnos"
  ON public.alumnos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('admin', 'docente')
    )
  );

-- ==========================================
-- 4. DOCENTES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.docentes (
  id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE PRIMARY KEY,
  numero_empleado VARCHAR(20) UNIQUE,
  especialidad_id INTEGER REFERENCES public.especialidades(id),
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.docentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "docentes_ven_propia_info"
  ON public.docentes FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "admins_ven_docentes"
  ON public.docentes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- ==========================================
-- 5. MATERIAS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.materias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  especialidad_id INTEGER REFERENCES public.especialidades(id),
  grado INTEGER CHECK (grado BETWEEN 1 AND 6),
  creditos INTEGER DEFAULT 5,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materias de ejemplo para Programación (especialidad_id = 1)
INSERT INTO public.materias (nombre, especialidad_id, grado) VALUES
  ('Programación Orientada a Objetos', 1, 5),
  ('Bases de Datos', 1, 5),
  ('Desarrollo Web', 1, 5),
  ('Matemáticas Aplicadas', 1, 5),
  ('Inglés Técnico', 1, 5),
  ('Ética Profesional', 1, 5),
  ('Física', 1, 5),
  ('Química', 1, 5)
ON CONFLICT DO NOTHING;

ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_leen_materias"
  ON public.materias FOR SELECT
  TO authenticated
  USING (true);

-- ==========================================
-- 6. GRUPOS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.grupos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  grado INTEGER CHECK (grado BETWEEN 1 AND 6),
  grupo VARCHAR(10),
  especialidad_id INTEGER REFERENCES public.especialidades(id),
  ciclo_escolar VARCHAR(20),
  docente_guia_id UUID REFERENCES public.docentes(id),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_leen_grupos"
  ON public.grupos FOR SELECT
  TO authenticated
  USING (true);

-- ==========================================
-- 7. GRUPOS_MATERIAS (Relación M:N)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.grupos_materias (
  id SERIAL PRIMARY KEY,
  grupo_id INTEGER REFERENCES public.grupos(id) ON DELETE CASCADE,
  materia_id INTEGER REFERENCES public.materias(id) ON DELETE CASCADE,
  docente_id UUID REFERENCES public.docentes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(grupo_id, materia_id)
);

ALTER TABLE public.grupos_materias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_leen_grupos_materias"
  ON public.grupos_materias FOR SELECT
  TO authenticated
  USING (true);

-- ==========================================
-- 8. CALIFICACIONES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.calificaciones (
  id SERIAL PRIMARY KEY,
  alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE,
  materia_id INTEGER REFERENCES public.materias(id),
  parcial INTEGER CHECK (parcial BETWEEN 1 AND 3),
  calificacion DECIMAL(4,2) CHECK (calificacion BETWEEN 0 AND 10),
  ciclo_escolar VARCHAR(20) DEFAULT '2024-1',
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(alumno_id, materia_id, parcial, ciclo_escolar)
);

CREATE INDEX IF NOT EXISTS idx_calificaciones_alumno ON public.calificaciones(alumno_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_materia ON public.calificaciones(materia_id);

-- RLS
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alumnos_ven_propias_calificaciones"
  ON public.calificaciones FOR SELECT
  USING (auth.uid() = alumno_id);

CREATE POLICY "padres_ven_calificaciones_hijos"
  ON public.calificaciones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.alumnos
      WHERE id = alumno_id AND padre_id = auth.uid()
    )
  );

CREATE POLICY "docentes_admins_gestionan_calificaciones"
  ON public.calificaciones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('admin', 'docente')
    )
  );

-- ==========================================
-- 9. ASISTENCIAS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.asistencias (
  id SERIAL PRIMARY KEY,
  alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE,
  materia_id INTEGER REFERENCES public.materias(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  estado VARCHAR(20) CHECK (estado IN ('presente', 'falta', 'retardo', 'justificada')) DEFAULT 'presente',
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(alumno_id, materia_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_asistencias_alumno ON public.asistencias(alumno_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON public.asistencias(fecha);

-- RLS
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alumnos_ven_propias_asistencias"
  ON public.asistencias FOR SELECT
  USING (auth.uid() = alumno_id);

CREATE POLICY "padres_ven_asistencias_hijos"
  ON public.asistencias FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.alumnos
      WHERE id = alumno_id AND padre_id = auth.uid()
    )
  );

CREATE POLICY "docentes_admins_gestionan_asistencias"
  ON public.asistencias FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol IN ('admin', 'docente')
    )
  );

-- ==========================================
-- TRIGGERS PARA UPDATED_AT
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_perfiles_updated_at
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alumnos_updated_at
  BEFORE UPDATE ON public.alumnos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calificaciones_updated_at
  BEFORE UPDATE ON public.calificaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ¡LISTO! Schema creado correctamente
-- ==========================================

SELECT '✅ Esquema de base de datos creado correctamente' AS resultado;
