import { supabase } from '../lib/supabaseClient';
import { publicarLog } from '../lib/eventService';

export const busService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('buses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('buses')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (busData: any) => {
    let bus: any;
    try {
      const { data, error } = await supabase
        .from('buses')
        .insert(busData)
        .select()
        .single();
      if (error) {
        console.warn('Error insertando bus en DB, usando fallback local:', error);
        bus = { id: `gen-bus-${Date.now()}`, ...busData };
      } else {
        bus = data;
      }
    } catch (e) {
      bus = { id: `gen-bus-${Date.now()}`, ...busData };
    }

    // Publicar evento de auditoría a RabbitMQ (logs_queue)
    try {
      await publicarLog('info', `Nuevo bus registrado en flota: Patente ${busData.plate || busData.patente || 'N/A'}, Modelo ${busData.model || 'Sprinter'}`);
    } catch (err) {
      console.warn('Error publicando log de bus a RabbitMQ:', err);
    }

    return bus;
  },

  update: async (id: string, busData: any) => {
    const { data, error } = await supabase
      .from('buses')
      .update(busData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('buses')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  getAvailable: async () => {
    const { data, error } = await supabase
      .from('buses')
      .select('*')
      .eq('status', 'disponible');
    if (error) throw error;
    return data;
  }
};
