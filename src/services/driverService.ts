import { supabase } from '../lib/supabaseClient';

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
    try {
      const { data, error } = await supabase
        .from('drivers')
        .insert(driverData)
        .select()
        .single();
      if (error) {
        console.warn('Error insertando driver en DB, usando fallback local:', error);
        return { id: `gen-driver-${Date.now()}`, ...driverData };
      }
      return data;
    } catch (e) {
      return { id: `gen-driver-${Date.now()}`, ...driverData };
    }
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
