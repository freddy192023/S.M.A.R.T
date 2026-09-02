import type { Seat } from '../types';
import { reservationService } from './reservationService';

export const seatService = {
  // Obtener la matriz de asientos de un viaje con estado en tiempo real
  getSeatsByTrip: async (tripId: string, capacity: number = 40, basePrice: number = 35): Promise<Seat[]> => {
    // 1. Obtener reservas confirmadas para este viaje
    const reservations = await reservationService.getByTripId(tripId);
    const reservedSeatNumbers = new Set(
      reservations.filter(r => r.status === 'confirmed').map(r => r.seat_number)
    );

    // 2. Generar lista de asientos
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
