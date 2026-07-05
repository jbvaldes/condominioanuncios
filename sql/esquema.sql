-- ESQUEMA COMPLETO PARA SUPABASE
-- Tablas: comunidades, perfiles, usuarios_comunidades, anuncios, historial_anuncios, avisos_fijos, patrocinadores, configuracion
-- Roles: superadmin, admin, editor, auspiciador, residente

-- 1. Tipo enum para roles
CREATE TYPE rol_comunidad AS ENUM ('superadmin', 'admin', 'editor', 'auspiciador', 'residente');

-- 2. Tabla de comunidades (edificios)
CREATE TABLE comunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  direccion TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Perfiles de usuario (enlazado con auth.users de Supabase)
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  email TEXT UNIQUE NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- 4. Relación usuario - comunidad - rol
CREATE TABLE usuarios_comunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  comunidad_id UUID REFERENCES comunidades(id) ON DELETE CASCADE,
  rol rol_comunidad NOT NULL DEFAULT 'residente',
  activo BOOLEAN DEFAULT true,
  UNIQUE (user_id, comunidad_id)
);

-- 5. Anuncios (uno activo por comunidad)
CREATE TABLE anuncios (
  id INT PRIMARY KEY DEFAULT 1,
  comunidad_id UUID REFERENCES comunidades(id) ON DELETE CASCADE,
  texto TEXT NOT NULL DEFAULT '',
  activo BOOLEAN DEFAULT true,
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 6. Historial de anuncios
CREATE TABLE historial_anuncios (
  id SERIAL PRIMARY KEY,
  comunidad_id UUID REFERENCES comunidades(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT now(),
  usuario_id UUID REFERENCES auth.users(id)
);

-- 7. Avisos fijos (recordatorios)
CREATE TABLE avisos_fijos (
  id SERIAL PRIMARY KEY,
  comunidad_id UUID REFERENCES comunidades(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  orden INT DEFAULT 0,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- 8. Patrocinadores (publicidad)
CREATE TABLE patrocinadores (
  id SERIAL PRIMARY KEY,
  comunidad_id UUID REFERENCES comunidades(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  contacto TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  vencimiento DATE,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- 9. Configuración (clave-valor por comunidad)
CREATE TABLE configuracion (
  comunidad_id UUID REFERENCES comunidades(id) ON DELETE CASCADE,
  clave TEXT NOT NULL,
  valor TEXT,
  PRIMARY KEY (comunidad_id, clave)
);

-- 10. Políticas RLS (ejemplos básicos, ajustables)

-- Habilitar RLS en todas las tablas
ALTER TABLE comunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_comunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE anuncios ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_anuncios ENABLE ROW LEVEL SECURITY;
ALTER TABLE avisos_fijos ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrocinadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas: los usuarios autenticados pueden ver los datos de su comunidad
-- (Se necesitaría crear una función auxiliar para obtener la comunidad del usuario, pero se deja como base)

-- Ejemplo para anuncios:
CREATE POLICY "Usuarios ven anuncios de su comunidad" ON anuncios
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM usuarios_comunidades WHERE comunidad_id = anuncios.comunidad_id
    )
  );

-- Los administradores/editor pueden modificar anuncios
CREATE POLICY "Admins y editores modifican anuncios" ON anuncios
  FOR INSERT OR UPDATE OR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM usuarios_comunidades 
      WHERE comunidad_id = anuncios.comunidad_id AND rol IN ('superadmin', 'admin', 'editor')
    )
  );

-- Para la TV (lectura pública), se puede crear una política que permita SELECT sin autenticación
-- (Esto se configura posteriormente según necesidad)
