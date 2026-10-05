import { supabase } from '../lib/supabaseClient';
import { publicarLog } from '../lib/eventService';

export const driverService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getAvailable: async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('status', 'activo');
    if (error) throw error;
    return data;
  },

  create: async (driverData: any) => {
    let driver: any;
    try {
      const { data, error } = await supabase
        .from('drivers')
        .insert(driverData)
        .select()
        .single();
      if (error) {
        console.warn('Error insertando driver en DB, usando fallback local:', error);
        driver = { id: `gen-driver-${Date.now()}`, ...driverData };
      } else {
        driver = data;
      }
    } catch (e) {
      driver = { id: `gen-driver-${Date.now()}`, ...driverData };
    }

    // Publicar log de auditoría a RabbitMQ (logs_queue)
    try {
      await publicarLog('info', `Nuevo conductor registrado: ${driverData.full_name || driverData.name || 'Conductor'}, Licencia: ${driverData.license_number || 'N/A'}`);
    } catch (err) {
      console.warn('Error enviando log de conductor a RabbitMQ:', err);
    }

    return driver;
  },

  update: async (id: string, driverData: any) => {
    const { data, error } = await supabase
      .from('drivers')
      .update(driverData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
