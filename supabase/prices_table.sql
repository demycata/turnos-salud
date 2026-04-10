-- Tabla de precios de servicios
-- Ejecutar en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS service_prices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service     TEXT NOT NULL UNIQUE,
  price       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER service_prices_updated_at
  BEFORE UPDATE ON service_prices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE service_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_all_prices" ON service_prices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Datos iniciales
INSERT INTO service_prices (service, price) VALUES
  ('Control mensual', 15000),
  ('Control metalicos', 28000),
  ('Stripping', 22000),
  ('RX panoramica de control', 18000),
  ('Arco rectangular', 7000),
  ('Guardia', 0),
  ('Consulta por retiro o servicios adicionales', 0),
  ('Primera consulta', 10000),
  ('Brackets', 150000),
  ('Otro', 0)
ON CONFLICT (service) DO NOTHING;
