// TypeScript Interfaces for S.M.A.R.T

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Operador' | 'Conductor' | 'Pasajero';
  status: 'Activo' | 'Inactivo';
}

export interface Role {
  code: string;
  name: string;
  desc: string;
  permissions: string;
}

export interface Bus {
  code: string;
  plate: string;
  model: string;
  capacity: number;
  status: 'Activo' | 'Inactivo' | 'En Mantención';
}

export interface Driver {
  code: string;
  name: string;
  license: string;
  status: 'Activo' | 'En Viaje' | 'Descanso';
  phone: string;
}

export interface Route {
  code: string;
  name: string;
  origin: string;
  destination: string;
  status: 'Activa' | 'Inactiva';
  duration: string;
}

export interface Stop {
  code: string;
  name: string;
  address: string;
  type: 'Punto de Control' | 'Terminal' | 'Estándar';
}

export interface Trip {
  route: string;
  bus: string;
  conductor: string;
  date: string;
  time: string;
  status: 'Programado' | 'En Curso' | 'Finalizado';
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

export interface MockDataStore {
  users: User[];
  roles: Role[];
  buses: Bus[];
  drivers: Driver[];
  routes: Route[];
  stops: Stop[];
  trips: Trip[];
  reports: ReportsData;
}
