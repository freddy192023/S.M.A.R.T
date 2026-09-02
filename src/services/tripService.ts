import { supabase } from '../lib/supabaseClient';
import { routeService } from './routeService';
import { busService } from './busService';
import { driverService } from './driverService';

export const tripService = {
  getAllWithDetails: async () => {
    let dbTrips: any[] = [];

    try {
      // Intentar obtener viajes existentes en Supabase
      const { data, error } = await supabase
        .from('trips')
        .select(`
          id,
          departure_time,
          arrival_time,
          price,
          status,
          max_passengers,
          actual_passengers,
          observations,
          route_id,
          bus_id,
          driver_id,
          routes (id, name, origin, destination, distance_km, estimated_duration_min),
          buses (id, plate, model, capacity),
          drivers (id, full_name)
        `)
        .order('departure_time', { ascending: true });

      if (!error && data) {
        dbTrips = data;
      }
    } catch (e) {
      console.warn('Error consultando tabla trips de Supabase, recurriendo a rutas activas:', e);
    }

    // Obtener todas las rutas, buses, conductores y reservas registradas en el sistema
    let routes: any[] = [];
    let buses: any[] = [];
    let drivers: any[] = [];
    let allReservations: any[] = [];

    try {
      // Importante: usar el mismo servicio de reservas que seatService para consistencia 1:1
      const { reservationService } = await import('./reservationService');
      
      const [rData, bData, dData, resData] = await Promise.all([
        routeService.getAll(),
        busService.getAll(),
        driverService.getAll(),
        reservationService.getAll()
      ]);
      routes = (rData || []).filter((r: any) => r.status !== 'inactiva');
      buses = (bData || []).filter((b: any) => b.status === 'disponible' || b.status === 'Activo' || b.status === 'activo');
      drivers = (dData || []).filter((d: any) => d.status === 'activo' || d.status === 'Activo' || d.status === 'en_viaje');
      allReservations = (resData || []).filter(r => r.status === 'confirmed');
    } catch (e) {
      console.warn('Error obteniendo datos complementarios:', e);
    }

    const mappedDbTrips = dbTrips.map((trip: any) => {
      const busCapacity = trip.buses?.capacity || trip.max_passengers || 40;
      const bookedCount = allReservations.filter((r: any) => 
        r.trip_id === trip.id || (trip.route_id && r.trip?.route_id === trip.route_id)
      ).length;
      const basePrice = Number(trip.price) || 35.00;

      return {
        id: trip.id,
        route_id: trip.route_id || trip.routes?.id,
        route: trip.routes?.name || 'Ruta General',
        origin: trip.routes?.origin || 'Origen Central',
        destination: trip.routes?.destination || 'Destino',
        bus: trip.buses?.plate || 'Bus B-01',
        bus_model: trip.buses?.model || 'Estándar',
        bus_capacity: busCapacity,
        conductor: trip.drivers?.full_name || 'Conductor Asignado',
        date: trip.departure_time ? new Date(trip.departure_time).toLocaleDateString() : new Date().toLocaleDateString(),
        time: trip.departure_time ? new Date(trip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:00',
        departure_time: trip.departure_time || new Date().toISOString(),
        arrival_time: trip.arrival_time,
        status: mapStatus(trip.status),
        price: basePrice,
        max_passengers: busCapacity,
        actual_passengers: bookedCount,
        available_seats: Math.max(0, busCapacity - bookedCount),
        raw: trip
      };
    });

    // Si hay rutas en el sistema, aseguramos que CADA RUTA tenga viajes programados hoy y mañana
    const generatedTrips: any[] = [];
    const departureHours = ['07:30', '10:00', '13:30', '16:00', '19:30', '21:45'];

    routes.forEach((route, rIdx) => {
      // Verificar si la ruta ya tiene viajes en dbTrips
      const hasTripsInDb = mappedDbTrips.some(t => t.route_id === route.id || t.route === route.name);

      if (!hasTripsInDb || mappedDbTrips.length < 3) {
        const assignedBus = buses[rIdx % (buses.length || 1)] || { plate: `BUS-00${rIdx + 1}`, model: 'Volvo B8RLE', capacity: 40 };
        const assignedDriver = drivers[rIdx % (drivers.length || 1)] || { full_name: 'Conductor Asignado' };
        
        // Calcular precio estimado según distancia o duración
        const price = route.distance_km ? Math.max(25, Math.round(route.distance_km * 1.5)) : 35.00;
        const capacity = assignedBus.capacity || 40;

        // Generar 2 fechas: hoy y mañana
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        [today, tomorrow].forEach((baseDate, dIdx) => {
          const dateStr = baseDate.toISOString().split('T')[0];
          const timeSlot = departureHours[(rIdx * 2 + dIdx) % departureHours.length];
          const depIso = `${dateStr}T${timeSlot}:00`;
          const tripId = `gen-trip-${route.id || rIdx}-${dIdx}`;

          // Contar reservas confirmadas para este viaje o ruta
          const bookedCount = allReservations.filter((r: any) => 
            r.trip_id === tripId || 
            (route.id && r.trip?.route_id === route.id) ||
            r.trip_id === route.id
          ).length;

          generatedTrips.push({
            id: tripId,
            route_id: route.id,
            route: route.name,
            origin: route.origin,
            destination: route.destination,
            bus: assignedBus.plate,
            bus_model: assignedBus.model,
            bus_capacity: capacity,
            conductor: assignedDriver.full_name,
            date: baseDate.toLocaleDateString(),
            time: timeSlot,
            departure_time: depIso,
            status: 'Programado',
            price: price,
            max_passengers: capacity,
            actual_passengers: bookedCount,
            available_seats: Math.max(0, capacity - bookedCount),
            raw: { generated: true }
          });
        });
      }
    });

    return [...mappedDbTrips, ...generatedTrips];
  },

  getAvailableForBooking: async (origin?: string, destination?: string, date?: string) => {
    const all = await tripService.getAllWithDetails();
    return all.filter((t: any) => {
      const isScheduledOrCurrent = t.status === 'Programado' || t.status === 'En Curso';
      if (!isScheduledOrCurrent) return false;

      let match = true;
      if (origin && origin.trim()) {
        const origQuery = origin.toLowerCase().trim();
        match = match && (
          t.origin.toLowerCase().includes(origQuery) || 
          t.route.toLowerCase().includes(origQuery)
        );
      }
      if (destination && destination.trim()) {
        const destQuery = destination.toLowerCase().trim();
        match = match && (
          t.destination.toLowerCase().includes(destQuery) || 
          t.route.toLowerCase().includes(destQuery)
        );
      }
      if (date && date.trim()) {
        const tripDate = t.departure_time ? t.departure_time.split('T')[0] : '';
        if (tripDate) {
          match = match && tripDate === date;
        }
      }
      return match;
    });
  },

  getById: async (id: string) => {
    const all = await tripService.getAllWithDetails();
    return all.find((t: any) => t.id === id) || null;
  },

  create: async (tripData: any) => {
    const { data, error } = await supabase
      .from('trips')
      .insert(tripData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('trips')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// Pequeño helper para mapear estados de base de datos a las etiquetas del front
const mapStatus = (status: string): 'Programado' | 'En Curso' | 'Finalizado' | 'Cancelado' => {
  if (status === 'en_curso') return 'En Curso';
  if (status === 'finalizado') return 'Finalizado';
  if (status === 'cancelado') return 'Cancelado';
  return 'Programado';
};
