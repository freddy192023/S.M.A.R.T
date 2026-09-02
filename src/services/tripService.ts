import { supabase } from '../lib/supabaseClient';

export const tripService = {
  getAllWithDetails: async () => {
    // Supabase realiza el JOIN relacional automáticamente utilizando las claves foráneas
    const { data, error } = await supabase
      .from('trips')
      .select(`
        id,
        departure_time,
        arrival_time,
        status,
        max_passengers,
        actual_passengers,
        observations,
        route_id,
        bus_id,
        driver_id,
        routes (name, origin, destination),
        buses (plate, model),
        drivers (full_name)
      `)
      .order('departure_time', { ascending: true });
    
    if (error) throw error;
    
    // Mapeamos los datos de relaciones para mantener compatibilidad con las interfaces del frontend
    return (data || []).map((trip: any) => {
      const busCapacity = trip.buses?.capacity || trip.max_passengers || 40;
      const actualPassengers = trip.actual_passengers || 0;
      // Precio base o calculado según duración/distancia
      const basePrice = trip.price || 35.00;

      return {
        id: trip.id,
        route: trip.routes?.name || 'Ruta sin nombre',
        origin: trip.routes?.origin || 'Origen Central',
        destination: trip.routes?.destination || 'Destino',
        bus: trip.buses?.plate || 'Sin Bus',
        bus_model: trip.buses?.model || 'Estándar',
        bus_capacity: busCapacity,
        conductor: trip.drivers?.full_name || 'Sin Asignar',
        date: trip.departure_time ? new Date(trip.departure_time).toLocaleDateString() : 'N/A',
        time: trip.departure_time ? new Date(trip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        departure_time: trip.departure_time,
        arrival_time: trip.arrival_time,
        status: mapStatus(trip.status),
        price: basePrice,
        max_passengers: busCapacity,
        actual_passengers: actualPassengers,
        available_seats: Math.max(0, busCapacity - actualPassengers),
        raw: trip
      };
    });
  },

  getAvailableForBooking: async (origin?: string, destination?: string, date?: string) => {
    const all = await tripService.getAllWithDetails();
    return all.filter((t: any) => {
      const isScheduledOrCurrent = t.status === 'Programado' || t.status === 'En Curso';
      if (!isScheduledOrCurrent) return false;

      let match = true;
      if (origin && origin.trim()) {
        match = match && (
          t.origin.toLowerCase().includes(origin.toLowerCase()) || 
          t.route.toLowerCase().includes(origin.toLowerCase())
        );
      }
      if (destination && destination.trim()) {
        match = match && (
          t.destination.toLowerCase().includes(destination.toLowerCase()) || 
          t.route.toLowerCase().includes(destination.toLowerCase())
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
