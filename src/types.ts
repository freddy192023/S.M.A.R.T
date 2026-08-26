// TypeScript Interfaces for S.M.A.R.T
// Alineados con el esquema de Supabase

export interface User {
  id: string;
  full_name: string;
  name: string;       // Alias de compatibilidad (se mapea desde full_name)
  email: string;
  role: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

export interface Role {
  code: string;
  name: string;
  desc: string;
  permissions: string;
}

export interface Bus {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  capacity: number;
  status: string;
  mileage?: number;
  last_maintenance?: string;
  created_at?: string;
}

export interface Driver {
  id: string;
  full_name: string;
  license_number: string;
  license_expiry: string;
  phone: string;
  email?: string;
  status: string;
  hire_date?: string;
  created_at?: string;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance_km?: number;
  estimated_duration_min?: number;
  status: string;
  created_at?: string;
}

export interface Stop {
  id: string;
  route_id?: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  stop_order: number;
  estimated_arrival_min?: number;
  routes?: { name: string };
}

export interface Trip {
  id: string;
  route_id?: string;
  bus_id?: string;
  driver_id?: string;
  departure_time: string;
  arrival_time?: string;
  status: string;
  max_passengers?: number;
  actual_passengers?: number;
  observations?: string;
  // Campos calculados por el servicio
  route?: string;
  bus?: string;
  conductor?: string;
  date?: string;
  time?: string;
  raw?: any;
}

export interface BusUtilization {
  bus: string;
  trips: number;
  hours: number;
}

export interface TripCountByDay {
  labels: string[];
  data: number[];
}

export interface ReportsData {
  tripCountByDay: TripCountByDay;
  busUtilization: BusUtilization[];
}
