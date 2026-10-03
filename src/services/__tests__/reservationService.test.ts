import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reservationService, generateReservationCode } from '../reservationService';

// Mock de Supabase Client
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../../lib/supabaseClient';

const createMockQueryBuilder = (defaultData: any = null, defaultError: any = null) => {
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => Promise.resolve({ data: defaultData, error: defaultError })),
    then: (onfulfilled?: any) => Promise.resolve({ data: defaultData, error: defaultError }).then(onfulfilled),
  };
  return builder;
};

describe('CP-02: Creación y Validación de Reservas Multi-Asiento (RF-16, RNF-05)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe generar un código de reserva único con prefijo SMART- y 6 dígitos', () => {
    const code = generateReservationCode();
    expect(code).toMatch(/^SMART-\d{6}$/);
  });

  it('debe crear una reserva exitosamente y asignarle un código de comprobante', async () => {
    // ---- ARRANGE ----
    const mockCreatedReservation = {
      id: 'res-uuid-999',
      passenger_id: 'usr-pasajero-01',
      trip_id: 'trip-santiago-valpo-01',
      seat_number: 5,
      reservation_code: 'SMART-123456',
      price: 12000,
      status: 'confirmed',
      payment_method: 'Webpay Plus',
      payment_status: 'approved'
    };

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'reservations') {
        return createMockQueryBuilder(mockCreatedReservation, null);
      }
      return createMockQueryBuilder([], null);
    });

    // ---- ACT ----
    const resultado = await reservationService.create({
      passenger_id: 'usr-pasajero-01',
      trip_id: 'trip-santiago-valpo-01',
      seat_number: 5,
      price: 12000,
      payment_method: 'Webpay Plus',
      passenger_name: 'Juan Pérez',
      passenger_email: 'juan@smart.cl'
    });

    // ---- ASSERT ----
    expect(resultado).toBeDefined();
    expect(resultado.seat_number).toBe(5);
    expect(resultado.status).toBe('confirmed');
    expect(resultado.reservation_code).toMatch(/^SMART-/);
  });

  it('debe utilizar almacenamiento local cuando Supabase genera un error de red', async () => {
    // ---- ARRANGE ----
    (supabase.from as any).mockImplementation(() => 
      createMockQueryBuilder(null, { message: 'Network Connection Lost' })
    );

    // ---- ACT ----
    const resultado = await reservationService.create({
      passenger_id: 'usr-offline-01',
      trip_id: 'trip-offline-99',
      seat_number: 12,
      price: 10500
    });

    // ---- ASSERT ----
    expect(resultado).toBeDefined();
    expect(resultado.seat_number).toBe(12);
    expect(resultado.reservation_code).toMatch(/^SMART-/);
  });
});
