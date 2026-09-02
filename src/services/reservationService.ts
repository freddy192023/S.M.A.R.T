import { supabase } from '../lib/supabaseClient';
import type { Reservation } from '../types';
import { tripService } from './tripService';

const LOCAL_STORAGE_KEY = 'smart_reservations_data';

// Helper para leer del almacenamiento local de respaldo
const getLocalReservations = (): Reservation[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error leyendo reservas locales:', e);
    return [];
  }
};

// Helper para guardar en el almacenamiento local
const saveLocalReservations = (reservations: Reservation[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reservations));
  } catch (e) {
    console.error('Error guardando reservas locales:', e);
  }
};

// Generador de código de reserva SMART-XXXXXX
export const generateReservationCode = (): string => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `SMART-${randomNum}`;
};

export const reservationService = {
  // Obtener todas las reservas con detalles de viaje
  getAll: async (): Promise<Reservation[]> => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          passenger_id,
          trip_id,
          seat_number,
          reservation_code,
          reservation_date,
          price,
          status,
          payment_method,
          payment_status,
          profiles:passenger_id (full_name, email, phone)
        `)
        .order('reservation_date', { ascending: false });

      if (error) throw error;

      const trips = await tripService.getAllWithDetails();

      return (data || []).map((res: any) => {
        const trip = trips.find(t => t.id === res.trip_id);
        const profile = res.profiles || {};
        return {
          id: res.id,
          passenger_id: res.passenger_id,
          trip_id: res.trip_id,
          seat_number: res.seat_number,
          reservation_code: res.reservation_code,
          reservation_date: res.reservation_date,
          price: Number(res.price) || (trip?.price || 35.00),
          status: res.status || 'confirmed',
          payment_method: res.payment_method || 'Pago Digital Simulado',
          payment_status: res.payment_status || 'approved',
          passenger_name: profile.full_name || 'Pasajero S.M.A.R.T',
          passenger_email: profile.email || '',
          passenger_phone: profile.phone || '',
          trip
        };
      });
    } catch (err) {
      console.warn('Usando almacenamiento local para reservas:', err);
      const local = getLocalReservations();
      const trips = await tripService.getAllWithDetails();
      return local.map(r => ({
        ...r,
        trip: r.trip || trips.find(t => t.id === r.trip_id)
      }));
    }
  },

  // Obtener reservas de un pasajero específico
  getByPassengerId: async (passengerId: string): Promise<Reservation[]> => {
    const all = await reservationService.getAll();
    return all.filter(r => r.passenger_id === passengerId);
  },

  // Obtener reservas asociadas a un viaje específico (para ver asientos ocupados)
  getByTripId: async (tripId: string): Promise<Reservation[]> => {
    const all = await reservationService.getAll();
    return all.filter(r => r.trip_id === tripId && r.status !== 'cancelled');
  },

  // Obtener una reserva por su ID o código
  getById: async (idOrCode: string): Promise<Reservation | null> => {
    const all = await reservationService.getAll();
    return all.find(r => r.id === idOrCode || r.reservation_code === idOrCode) || null;
  },

  // Crear una nueva reserva
  create: async (reservationData: {
    passenger_id: string;
    trip_id: string;
    seat_number: number;
    price: number;
    payment_method?: string;
    passenger_name?: string;
    passenger_email?: string;
    passenger_phone?: string;
  }): Promise<Reservation> => {
    const code = generateReservationCode();
    const newReservation: Reservation = {
      id: crypto.randomUUID ? crypto.randomUUID() : `res-${Date.now()}`,
      passenger_id: reservationData.passenger_id,
      trip_id: reservationData.trip_id,
      seat_number: reservationData.seat_number,
      reservation_code: code,
      reservation_date: new Date().toISOString(),
      price: reservationData.price,
      status: 'confirmed',
      payment_method: reservationData.payment_method || 'Tarjeta Simulación',
      payment_status: 'approved',
      passenger_name: reservationData.passenger_name,
      passenger_email: reservationData.passenger_email,
      passenger_phone: reservationData.passenger_phone
    };

    // Intentar guardar en Supabase
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          passenger_id: newReservation.passenger_id,
          trip_id: newReservation.trip_id,
          seat_number: newReservation.seat_number,
          reservation_code: newReservation.reservation_code,
          reservation_date: newReservation.reservation_date,
          price: newReservation.price,
          status: newReservation.status,
          payment_method: newReservation.payment_method,
          payment_status: newReservation.payment_status
        })
        .select()
        .single();

      if (!error && data) {
        newReservation.id = data.id;
      }
    } catch (e) {
      console.warn('Supabase no disponible para reservations, guardando localmente:', e);
    }

    // Siempre guardar/actualizar en local storage para resiliencia offline e instantánea
    const local = getLocalReservations();
    saveLocalReservations([newReservation, ...local]);

    // Asociar datos del viaje
    const trip = await tripService.getById(reservationData.trip_id);
    newReservation.trip = trip || undefined;

    return newReservation;
  },

  // Cancelar una reserva
  cancel: async (reservationId: string): Promise<boolean> => {
    try {
      await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId);
    } catch (e) {
      console.warn('Error cancelando en Supabase:', e);
    }

    // Actualizar local
    const local = getLocalReservations();
    const updated = local.map(r => r.id === reservationId ? { ...r, status: 'cancelled' as const } : r);
    saveLocalReservations(updated);

    return true;
  }
};
