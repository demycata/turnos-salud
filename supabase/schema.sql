-- ============================================================
-- SALUD TURNOS — Supabase Schema
-- Correr en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS patients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,
  address     TEXT,
  neighborhood TEXT,
  birth_date  DATE,
  sex         TEXT CHECK (sex IN ('M', 'F', 'Otro')),
  document    TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de turnos
CREATE TABLE IF NOT EXISTS appointments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  professional  TEXT,
  service       TEXT,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'done', 'cancelled', 'no_show')),
  payment_method TEXT,
  amount        NUMERIC(12, 2),
  internal_notes TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(full_name);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) — solo para usuarios autenticados del staff
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Política: solo usuarios autenticados pueden ver y modificar
CREATE POLICY "authenticated_all_patients" ON patients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_all_appointments" ON appointments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Datos de ejemplo (opcional, borrar en producción)
INSERT INTO patients (full_name, phone, email, address, neighborhood, birth_date, sex, document) VALUES
  ('María González', '1155556789', 'maria@email.com', 'Av. San Martín 1234', 'San Miguel', '1990-03-15', 'F', '30123456'),
  ('Carlos Rodríguez', '1144447890', 'carlos@email.com', 'Belgrano 567', 'Moreno', '1985-07-22', 'M', '28765432'),
  ('Jazmin Díaz', '1125681988', 'monifer577@gmail.com', 'Corrientes 890', 'Moreno', '2009-11-28', 'F', '49884115');

-- ============================================================
-- CREAR PRIMER USUARIO (ejecutar separado despues del schema)
-- ============================================================
-- Opcion 1: Desde Supabase Dashboard
--   Authentication -> Users -> Add user -> ingresa email y password
--
-- Opcion 2: Via SQL (cambia el email y password)
-- SELECT supabase_auth.create_user(
--   '{"email": "admin@tuclinica.com", "password": "tu_password_seguro", "email_confirm": true}'::jsonb
-- );
