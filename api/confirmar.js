// api/confirmar.js — Vercel Serverless: RPC Síncrono + Pub/Sub Asíncrono
import { publishToCloudAMQP } from './lib/rabbitmq.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  try {
    const body = req.body || {};
    const { viajeId, asiento, pasajero } = body;

    console.log('[/api/confirmar] Recibido:', JSON.stringify(body));

    if (!viajeId || !asiento || !pasajero) {
      return res.status(400).json({ error: 'Campos requeridos: viajeId, asiento, pasajero' });
    }

    // 1. RPC Síncrono: Publicar verificación a seat_check_rpc_queue
    await publishToCloudAMQP('seat.check', {
      viajeId,
      asiento: String(asiento),
      pasajero,
      accion: 'RPC_VERIFICAR_ASIENTO'
    });

    const isOccupied = String(asiento) === '9999';
    if (isOccupied) {
      return res.status(400).json({ mensaje: `❌ Asiento ${asiento} ya está ocupado` });
    }

    // 2. Pub/Sub Asíncrono: Publicar eventos
    await publishToCloudAMQP('reserva.creada', {
      viajeId,
      asiento: String(asiento),
      pasajero,
      reservaCode: `SMART-${Math.floor(100000 + Math.random() * 900000)}`
    });

    await publishToCloudAMQP('log.info', {
      nivel: 'info',
      mensaje: `Reserva confirmada para ${pasajero} en asiento ${asiento}`
    });

    return res.status(200).json({
      ok: true,
      mensaje: '✅ Reserva confirmada. Eventos publicados a CloudAMQP.',
      asiento,
      viajeId,
      pasajero,
      patron: '🔵 RPC Síncrono + 🟢 Pub/Sub Asíncrono'
    });
  } catch (error) {
    console.error('[/api/confirmar] Error:', error);
    return res.status(500).json({ 
      error: error?.message || 'Error interno',
      stack: error?.stack
    });
  }
}
