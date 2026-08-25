import { supabase } from '../lib/supabaseClient';

export const stopService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('stops')
      .select(`
        *,
        routes (name)
      `)
      .order('stop_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  getByRoute: async (routeId: string) => {
    const { data, error } = await supabase
      .from('stops')
      .select('*')
      .eq('route_id', routeId)
      .order('stop_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  create: async (stopData: any) => {
    const { data, error } = await supabase
      .from('stops')
      .insert(stopData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, stopData: any) => {
    const { data, error } = await supabase
      .from('stops')
      .update(stopData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('stops')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
