import { supabase } from '../lib/supabaseClient';
import type { Seat } from '../types';
import { reservationService } from './reservationService';
import { tripService } from './tripService';

export const seatService = {
  // Obtener la matriz de asientos de un viaje con estado en tiempo real (compartido entre todos los usuarios)
  getSeatsByTrip: async (tripId: string, capacity: number = 40, basePrice: number = 35): Promise<Seat[]> => {
    const reservedSeatNumbers = new Set<number>();

    // 1. Obtener detalles del viaje para saber si tiene un UUID real o virtual
    let realTripId = tripId;
    let routeId: string | undefined;

    try {
      const trip = await tripService.getById(tripId);
      if (trip) {
        routeId = trip.route_id;
        // Si el viaje tiene un id real en DB
        if (!trip.id.startsWith('gen-trip-')) {
          realTripId = trip.id;
        }
      }
    } catch (e) {
      console.warn('Error resolviendo trip para asientos:', e);
    }

    // 2. Consultar directamente a Supabase para obtener reservas en vivo de otros usuarios
    try {
      const { data: dbRes, error } = await supabase
        .from('reservations')
        .select('seat_number, trip_id, status')
        .eq('status', 'confirmed');

      if (!error && dbRes) {
        dbRes.forEach((r: any) => {
          if (r.trip_id === tripId || r.trip_id === realTripId) {
            reservedSeatNumbers.add(Number(r.seat_number));
          }
        });
      }
    } catch (err) {
      console.warn('Error consultando reservas de Supabase para asientos:', err);
    }

    // 3. Cruzar también con el servicio de reservas (incluye memoria y local storage)
    try {
      const localReservations = await reservationService.getAll();
      localReservations
        .filter(r => r.status === 'confirmed')
        .forEach(r => {
          if (
            r.trip_id === tripId || 
            r.trip_id === realTripId || 
            (routeId && r.trip?.route_id === routeId)
          ) {
            reservedSeatNumbers.add(Number(r.seat_number));
          }
        });
    } catch (e) {
      console.warn('Error procesando reservas locales:', e);
    }

    // 4. Generar la matriz de asientos del autobús
    const totalSeats = capacity > 0 ? capacity : 40;
    const seats: Seat[] = [];

    for (let i = 1; i <= totalSeats; i++) {
      const isReserved = reservedSeatNumbers.has(i);
      seats.push({
        id: `seat-${tripId}-${i}`,
        seat_number: i,
        status: isReserved ? 'reserved' : 'available',
        price: basePrice
      });
    }

    return seats;
  }
};
