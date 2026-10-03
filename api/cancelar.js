// api/cancelar.js — Vercel Serverless: Cancelación de Reserva (Pub/Sub)
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
    const { viajeId, asiento, pasajero, reservaCode } = body;

    console.log('[/api/cancelar] Recibido:', JSON.stringify(body));

    // Publicar evento reserva.cancelada
    await publishToCloudAMQP('reserva.cancelada', {
      viajeId: viajeId || 'VJ-DESCONOCIDO',
      asiento: String(asiento || '0'),
      pasajero: pasajero || 'Pasajero Anónimo',
      reservaCode: reservaCode || `SMART-${Math.floor(100000 + Math.random() * 900000)}`
    });

    // Publicar log de warning
    await publishToCloudAMQP('log.warning', {
      nivel: 'warning',
      mensaje: `Reserva cancelada por ${pasajero || 'Pasajero'} en asiento ${asiento}`
    });

    return res.status(200).json({
      ok: true,
      mensaje: '🔴 Reserva cancelada. Asiento liberado vía CloudAMQP.',
      patron: '🟢 Pub/Sub Asíncrono'
    });
  } catch (error) {
    console.error('[/api/cancelar] Error:', error);
    return res.status(500).json({ error: error?.message || 'Error interno' });
  }
}
