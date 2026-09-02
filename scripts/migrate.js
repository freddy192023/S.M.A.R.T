import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: La variable DATABASE_URL no está definida en .env.local');
  process.exit(1);
}

const sql = `
-- ============================================
-- S.M.A.R.T - Esquema de Base de Datos
-- ============================================

-- 1. Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'pasajero' CHECK (role IN ('admin', 'operador', 'conductor', 'pasajero')),
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de buses
CREATE TABLE IF NOT EXISTS public.buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  status TEXT DEFAULT 'disponible' CHECK (status IN ('disponible', 'en_mantenimiento', 'en_viaje', 'inactivo')),
  mileage INTEGER DEFAULT 0,
  last_maintenance DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de conductores
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  license_expiry DATE NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'en_viaje', 'descanso', 'inactivo')),
  hire_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de rutas
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance_km NUMERIC(10,2) CHECK (distance_km > 0),
  estimated_duration_min INTEGER CHECK (estimated_duration_min > 0),
  status TEXT DEFAULT 'activa' CHECK (status IN ('activa', 'inactiva', 'en_mantenimiento')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de paraderos
CREATE TABLE IF NOT EXISTS public.stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  stop_order INTEGER NOT NULL,
  estimated_arrival_min INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de viajes
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
  bus_id UUID REFERENCES public.buses(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ,
  price NUMERIC(10,2) DEFAULT 35.00,
  status TEXT DEFAULT 'programado' CHECK (status IN ('programado', 'en_curso', 'finalizado', 'cancelado', 'retrasado')),
  max_passengers INTEGER DEFAULT 40,
  actual_passengers INTEGER DEFAULT 0,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de asientos
CREATE TABLE IF NOT EXISTS public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id UUID REFERENCES public.buses(id) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'unavailable')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bus_id, seat_number)
);

-- 8. Tabla de reservas
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL,
  reservation_code TEXT UNIQUE NOT NULL,
  reservation_date TIMESTAMPTZ DEFAULT NOW(),
  price NUMERIC(10,2) NOT NULL DEFAULT 35.00,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_method TEXT DEFAULT 'Tarjeta Simulación',
  payment_status TEXT DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar que las columnas nuevas existan si la tabla ya había sido creada
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 35.00;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS max_passengers INTEGER DEFAULT 40;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS actual_passengers INTEGER DEFAULT 0;

ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 35.00;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Tarjeta Simulación';
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'approved';

-- 8. Tabla de consentimientos
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('privacy_policy', 'data_processing', 'marketing')),
  granted BOOLEAN DEFAULT TRUE,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- ============================================
-- FUNCIONES Y TRIGGERS (UPDATED_AT)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_buses_updated_at ON public.buses;
CREATE TRIGGER update_buses_updated_at BEFORE UPDATE ON public.buses
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_drivers_updated_at ON public.drivers;
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_routes_updated_at ON public.routes;
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_trips_updated_at ON public.trips;
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- TRIGGER AUTOMÁTICO DE REGISTRO DE USUARIOS (ROBUSTO)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  display_name TEXT;
BEGIN
  display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    display_name,
    NEW.email,
    'pasajero'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCION Y TRIGGERS DE AUDITORÍA
-- ============================================

CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW)::jsonb ELSE NULL END
  );
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS audit_buses ON public.buses;
CREATE TRIGGER audit_buses AFTER INSERT OR UPDATE OR DELETE ON public.buses
FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS audit_drivers ON public.drivers;
CREATE TRIGGER audit_drivers AFTER INSERT OR UPDATE OR DELETE ON public.drivers
FOR EACH ROW EXECUTE FUNCTION log_audit();

DROP TRIGGER IF EXISTS audit_trips ON public.trips;
CREATE TRIGGER audit_trips AFTER INSERT OR UPDATE OR DELETE ON public.trips
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_trips_departure_time ON public.trips(departure_time);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_buses_status ON public.buses(status);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- ============================================
-- PERMISOS DE API DE SUPABASE
-- ============================================

-- Desactivar RLS en tablas principales para permitir prototipado y lectura sin restricciones iniciales
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;

-- Conceder permisos de uso y selección a los roles de la API de Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================
-- DATOS DE SEMILLERO (SEED DATA)
-- ============================================

INSERT INTO public.buses (plate, brand, model, year, capacity, status) VALUES
  ('ABCD-12', 'Mercedes-Benz', 'Sprinter', 2022, 20, 'disponible'),
  ('EFGH-34', 'Volvo', 'B9R', 2023, 45, 'disponible'),
  ('IJKL-56', 'Scania', 'K410', 2021, 50, 'en_mantenimiento'),
  ('MNOP-78', 'MAN', 'Lion''s Coach', 2022, 55, 'disponible')
ON CONFLICT (plate) DO NOTHING;

INSERT INTO public.drivers (full_name, license_number, license_expiry, phone) VALUES
  ('Juan Pérez', 'LIC-001', '2027-12-31', '+56912345678'),
  ('María González', 'LIC-002', '2026-08-15', '+56987654321'),
  ('Carlos Rodríguez', 'LIC-003', '2025-11-30', '+56911223344')
ON CONFLICT (license_number) DO NOTHING;

INSERT INTO public.routes (name, origin, destination, distance_km, estimated_duration_min) VALUES
  ('Ruta Norte', 'Santiago Centro', 'Quilicura', 18.5, 45),
  ('Ruta Sur', 'Santiago Centro', 'San Bernardo', 22.3, 55),
  ('Ruta Oriente', 'Providencia', 'Las Condes', 12.7, 30),
  ('Ruta Poniente', 'Santiago Centro', 'Cerro Navia', 15.2, 40)
ON CONFLICT DO NOTHING;

-- Insertar viajes activos para las rutas existentes con buses y choferes
INSERT INTO public.trips (route_id, bus_id, driver_id, departure_time, arrival_time, price, status, max_passengers)
SELECT 
  r.id as route_id,
  b.id as bus_id,
  d.id as driver_id,
  NOW() + (interval '1 hour' * (row_number() over (order by r.id))) as departure_time,
  NOW() + (interval '1 hour' * (row_number() over (order by r.id))) + (interval '45 minutes') as arrival_time,
  35.00 as price,
  'programado' as status,
  b.capacity as max_passengers
FROM public.routes r
CROSS JOIN LATERAL (SELECT id, capacity FROM public.buses LIMIT 1) b
CROSS JOIN LATERAL (SELECT id FROM public.drivers LIMIT 1) d
WHERE NOT EXISTS (SELECT 1 FROM public.trips);
`;

async function runMigration() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Conectando a Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Conexión establecida.');
    console.log('🔄 Ejecutando scripts de base de datos...');
    await client.query(sql);
    console.log('🎉 Migración completada con éxito. Base de datos de S.M.A.R.T configurada.');
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
  } finally {
    await client.end();
  }
}

runMigration();
