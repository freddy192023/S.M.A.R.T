import { supabase } from '../lib/supabaseClient';

export const routeService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  getActive: async () => {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('status', 'activa');
    if (error) throw error;
    return data;
  },

  create: async (routeData: any) => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .insert(routeData)
        .select()
        .single();
      if (error) {
        console.warn('Error insertando route en DB, usando fallback local:', error);
        return { id: `gen-route-${Date.now()}`, ...routeData };
      }
      return data;
    } catch (e) {
      return { id: `gen-route-${Date.now()}`, ...routeData };
    }
  },

  update: async (id: string, routeData: any) => {
    const { data, error } = await supabase
      .from('routes')
      .update(routeData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
