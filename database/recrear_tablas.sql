-- ==========================================
-- ELIMINAR TABLA PERFILES Y RECREARLA
-- ==========================================

-- ADVERTENCIA: Esto borrará todos los datos en perfiles
-- Solo ejecutar si estás de acuerdo

-- 1. Eliminar tablas dependientes primero
DROP TABLE IF EXISTS public.calificaciones CASCADE;
DROP TABLE IF EXISTS public.asistencias CASCADE;
DROP TABLE IF EXISTS public.grupos_materias CASCADE;
DROP TABLE IF EXISTS public.grupos CASCADE;
DROP TABLE IF EXISTS public.alumnos CASCADE;
DROP TABLE IF EXISTS public.docentes CASCADE;

-- 2. Eliminar y recrear perfiles
DROP TABLE IF EXISTS public.perfiles CASCADE;

CREATE TABLE public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'docente', 'alumno', 'padre')),
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  avatar_url TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Recrear tablas dependientes
CREATE TABLE public.docentes (
  id UUID PRIMARY KEY REFERENCES public.perfiles(id) ON DELETE CASCADE,
  numero_empleado VARCHAR(20) UNIQUE,
  especialidad_id INTEGER REFERENCES public.especialidades(id),
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.alumnos (
  id UUID PRIMARY KEY REFERENCES public.perfiles(id) ON DELETE CASCADE,
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

CREATE TABLE public.grupos (
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

CREATE TABLE public.grupos_materias (
  id SERIAL PRIMARY KEY,
  grupo_id INTEGER REFERENCES public.grupos(id) ON DELETE CASCADE,
  materia_id INTEGER REFERENCES public.materias(id) ON DELETE CASCADE,
  docente_id UUID REFERENCES public.docentes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(grupo_id, materia_id)
);

CREATE TABLE public.calificaciones (
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

CREATE TABLE public.asistencias (
  id SERIAL PRIMARY KEY,
  alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE,
  materia_id INTEGER REFERENCES public.materias(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  estado VARCHAR(20) CHECK (estado IN ('presente', 'falta', 'retardo', 'justificada')) DEFAULT 'presente',
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(alumno_id, materia_id, fecha)
);

-- 4. Habilitar RLS en todas las tablas
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos_materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;

SELECT '✅ Tablas recreadas correctamente con el constraint correcto' AS resultado;
