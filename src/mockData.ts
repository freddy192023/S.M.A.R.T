// Datos de prueba locales (legacy, se reemplazará progresivamente por servicios Supabase)

export const MOCK_DATA: any = {
  users: [
    { id: "U-001", name: "Carlos Administrador", email: "admin@smart.com", role: "Administrador", status: "Activo" },
    { id: "U-002", name: "Laura Operadora", email: "operator@smart.com", role: "Operador", status: "Activo" },
    { id: "U-003", name: "Juan Pérez", email: "driver@smart.com", role: "Conductor", status: "Activo" },
    { id: "U-004", name: "María González", email: "user@smart.com", role: "Pasajero", status: "Activo" },
    { id: "U-005", name: "Pedro Conductor", email: "pedro@smart.com", role: "Conductor", status: "Activo" },
    { id: "U-006", name: "Sofía Martínez", email: "sofia@smart.com", role: "Operador", status: "Inactivo" }
  ],
  
  roles: [
    { code: "ADM", name: "Administrador", desc: "Acceso total a configuraciones, usuarios y auditoría", permissions: "Total" },
    { code: "OPE", name: "Operador", desc: "Gestión operacional de buses, rutas, paraderos y viajes", permissions: "Operación" },
    { code: "CON", name: "Conductor", desc: "Visualización de viajes asignados y reportes de incidentes", permissions: "Mis Viajes" },
    { code: "PAS", name: "Pasajero", desc: "Consulta pública de rutas, horarios y estados", permissions: "Consulta" }
  ],

  buses: [
    { code: "BUS-001", plate: "AB-CD-12", model: "Volvo Access B8RLE", capacity: 40, status: "Activo" },
    { code: "BUS-002", plate: "EF-GH-34", model: "Mercedes-Benz O500U", capacity: 42, status: "Activo" },
    { code: "BUS-003", plate: "IJ-KL-56", model: "Scania K280UB", capacity: 38, status: "En Mantención" },
    { code: "BUS-004", plate: "MN-OP-78", model: "BYD K9 Pure Electric", capacity: 35, status: "Activo" },
    { code: "BUS-005", plate: "QR-ST-90", model: "Marcopolo Torino Low Entry", capacity: 45, status: "Inactivo" }
  ],

  drivers: [
    { code: "DRV-001", name: "Juan Pérez", license: "Clase A3", status: "Activo", phone: "+56 9 8765 4321" },
    { code: "DRV-002", name: "Pedro Muñoz", license: "Clase A3", status: "Activo", phone: "+56 9 1234 5678" },
    { code: "DRV-003", name: "Ricardo Soto", license: "Clase A5", status: "En Viaje", phone: "+56 9 2468 1357" },
    { code: "DRV-004", name: "Ana Morales", license: "Clase A3", status: "Descanso", phone: "+56 9 9876 5432" }
  ],

  routes: [
    { code: "R-001", name: "Ruta Centro", origin: "Terminal Norte", destination: "Centro Cívico", status: "Activa", duration: "45 mins" },
    { code: "R-002", name: "Ruta 210", origin: "Metro Estación Central", destination: "Sector Norte", status: "Activa", duration: "60 mins" },
    { code: "R-003", name: "Ruta 302", origin: "Terminal Sur", destination: "Sector Oriente", status: "Activa", duration: "50 mins" },
    { code: "R-004", name: "Ruta Industrial", origin: "Terminal Poniente", destination: "Parque Industrial", status: "Inactiva", duration: "35 mins" }
  ],

  stops: [
    { code: "P-001", name: "Paradero Metro Moneda", address: "Alameda 1400", type: "Punto de Control" },
    { code: "P-002", name: "Paradero Estación Mapocho", address: "Av. Balmaceda 1100", type: "Terminal" },
    { code: "P-003", name: "Paradero Sector Industrial 1", address: "Av. Las Industrias 500", type: "Estándar" },
    { code: "P-004", name: "Paradero Plaza de Armas", address: "Catedral 1000", type: "Estándar" }
  ],

  trips: [
    { route: "R-001", bus: "BUS-001", conductor: "Juan Pérez", date: "19/08/2026", time: "08:30", status: "Programado" },
    { route: "R-002", bus: "BUS-002", conductor: "Pedro Muñoz", date: "19/08/2026", time: "09:00", status: "En Curso" },
    { route: "R-003", bus: "BUS-004", conductor: "Ricardo Soto", date: "19/08/2026", time: "10:15", status: "Programado" },
    { route: "R-001", bus: "BUS-001", conductor: "Juan Pérez", date: "18/08/2026", time: "14:20", status: "Finalizado" }
  ],

  reports: {
    tripCountByDay: {
      labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      data: [35, 42, 38, 48, 52, 20, 15]
    },
    busUtilization: [
      { bus: "BUS-001", trips: 14, hours: 28.5 },
      { bus: "BUS-002", trips: 12, hours: 24.0 },
      { bus: "BUS-003", trips: 0, hours: 0 },
      { bus: "BUS-004", trips: 18, hours: 36.2 }
    ]
  }
};
