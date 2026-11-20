/**
 * eventService.ts — S.M.A.R.T Messaging Integration
 *
 * Conecta el frontend React con el módulo smart-messaging (Spring Boot :8080).
 *
 * 🟢 ASÍNCRONO (Pub/Sub):
 *   publicarReservaCreada()    → POST /api/events/reserva
 *   publicarReservaCancelada() → POST /api/events/cancelacion
 *   publicarViajeProgramado()  → POST /api/events/viaje
 *   publicarLog()              → POST /api/events/log
 *
 * 🔵+🟢 COMBINADO (RPC síncrono + Pub/Sub asíncrono):
 *   confirmarReservaConRPC()   → POST /api/reservations/confirmar
 *
 * Diseño resiliente:
 *   Si el módulo smart-messaging no está activo, todos los métodos
 *   fallan silenciosamente (try/catch) y el flujo principal de
 *   Supabase no se interrumpe.
 */

import { supabase } from './supabaseClient';

const MESSAGING_API = '/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ReservaPayload {
  viajeId: string;
  asiento: number | string;
  pasajero: string;
  reservaCode?: string;
}

export interface ConfirmarReservaResult {
  ok: boolean;
  mensaje: string;
  asiento?: string;
  viajeId?: string;
  patron?: string;
}

// ─── Helper interno ───────────────────────────────────────────────────────────

async function post(endpoint: string, body: unknown): Promise<Response | null> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    // Inyección de JWT desde IDaaS (Bloque 6.2)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return await fetch(`${MESSAGING_API}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    // Módulo de mensajería no disponible — silent fail
    console.warn(`[EventService] Módulo de mensajería no disponible (${endpoint})`);
    return null;
  }
}

// ─── ⚡ MÉTODOS KAFKA (Bloque 4.3 y 6.2) ────────────────────────────────────────

/** Publica evento de viaje en Apache Kafka (smart.viajes) con autenticación JWT */
export async function publicarKafkaViaje(evento: unknown): Promise<void> {
  const res = await post('/kafka/events/viaje', evento);
  if (res?.ok) console.log('[EventService] ✅ Evento Kafka viaje publicado');
}

/** Publica evento de reserva en Apache Kafka (smart.reservas) con autenticación JWT */
export async function publicarKafkaReserva(evento: unknown): Promise<void> {
  const res = await post('/kafka/events/reserva', evento);
  if (res?.ok) console.log('[EventService] ✅ Evento Kafka reserva publicado');
}

/** Envía telemetría de bus en Apache Kafka (smart.telemetria) con autenticación JWT */
export async function publicarKafkaTelemetria(evento: unknown): Promise<void> {
  const res = await post('/kafka/events/telemetria', evento);
  if (res?.ok) console.log('[EventService] 📡 Evento Kafka telemetría enviado');
}

// ─── 🟢 MÉTODOS ASÍNCRONOS ────────────────────────────────────────────────────

/**
 * Publica evento "reserva.creada" → activa email + PDF + auditoría en background.
 * Fire-and-forget: no bloquea el hilo, falla silenciosamente si el módulo no está activo.
 *
 * @example
 * // Llamar después de guardar en Supabase:
 * publicarReservaCreada({ viajeId, asiento: seatNumber, pasajero: userName, reservaCode });
 */
export async function publicarReservaCreada(reserva: ReservaPayload): Promise<void> {
  const res = await post('/events/reserva', reserva);
  if (res?.ok) {
    console.log('[EventService] ✅ Evento reserva.creada publicado');
  }
}

/**
 * Publica evento "reserva.cancelada" → libera el asiento en background.
 *
 * @example
 * // Llamar al cancelar en reservationService.cancel():
 * publicarReservaCancelada({ viajeId, asiento: seatNumber, reservaCode });
 */
export async function publicarReservaCancelada(reserva: ReservaPayload): Promise<void> {
  const res = await post('/cancelar', reserva);
  if (res?.ok) {
    console.log('[EventService] ✅ Evento reserva.cancelada publicado');
  }
}

/**
 * Publica evento "viaje.programado" → notifica al conductor asignado.
 *
 * @example
 * // Llamar al programar un viaje desde el panel admin:
 * publicarViajeProgramado({ viajeId, ruta: 'Santiago → Valparaíso', conductorId, salida });
 */
export async function publicarViajeProgramado(viaje: Record<string, string>): Promise<void> {
  const res = await post('/viaje', viaje);
  if (res?.ok) {
    console.log('[EventService] ✅ Evento viaje.programado publicado');
  }
}

/**
 * Publica un log del sistema al módulo de mensajería.
 * No bloquea el hilo — falla silenciosamente.
 *
 * @param nivel   'info' | 'warning' | 'error'
 * @param mensaje Descripción del evento
 *
 * @example
 * publicarLog('error', 'No se pudo conectar a Supabase');
 * publicarLog('info', `Reserva ${code} creada por ${user}`);
 */
export async function publicarLog(
  nivel: 'info' | 'warning' | 'error',
  mensaje: string
): Promise<void> {
  await post('/log-error', { nivel, mensaje });
}

// ─── 🔵+🟢 FLUJO COMBINADO ───────────────────────────────────────────────────

/**
 * Confirma una reserva usando el flujo combinado:
 *   1. 🔵 RPC SÍNCRONO → verifica disponibilidad del asiento (bloquea hasta respuesta)
 *   2. 🟢 PUB/SUB → si disponible, publica evento (email + PDF + auditoría)
 *
 * A diferencia de los otros métodos, este NO falla silenciosamente:
 * lanza el error para que el componente pueda mostrar feedback al usuario.
 *
 * @example
 * // En SeatSelector.tsx o el flujo de reserva:
 * const result = await confirmarReservaConRPC({ viajeId, asiento: '4', pasajero: userName });
 * if (result.ok) {
 *   alert(result.mensaje);
 * } else {
 *   alert(result.mensaje); // "❌ Asiento ya ocupado..."
 * }
 */
export async function confirmarReservaConRPC(datos: {
  viajeId: string;
  asiento: string;
  pasajero: string;
}): Promise<ConfirmarReservaResult> {
  const res = await fetch(`${MESSAGING_API}/confirmar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    const msg = await res.text();
    return { ok: false, mensaje: msg };
  }

  const data = await res.json();
  return {
    ok: true,
    mensaje: data.mensaje,
    asiento: data.asiento,
    viajeId: data.viajeId,
    patron:  data.patron,
  };
}
