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
    return (data || []).map((trip: any) => ({
      id: trip.id,
      route: trip.routes?.name || 'Ruta sin nombre',
      bus: trip.buses?.plate || 'Sin Bus',
      conductor: trip.drivers?.full_name || 'Sin Asignar',
      date: trip.departure_time ? new Date(trip.departure_time).toLocaleDateString() : 'N/A',
      time: trip.departure_time ? new Date(trip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      status: mapStatus(trip.status),
      raw: trip
    }));
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
const mapStatus = (status: string): 'Programado' | 'En Curso' | 'Finalizado' => {
  if (status === 'en_curso') return 'En Curso';
  if (status === 'finalizado') return 'Finalizado';
  return 'Programado';
};
