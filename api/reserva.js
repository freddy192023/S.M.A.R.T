// api/reserva.js — Vercel Serverless: Pub/Sub Asíncrono (reserva.creada)
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

    console.log('[/api/reserva] Recibido:', JSON.stringify(body));

    // Publicar evento reserva.creada
    const routed = await publishToCloudAMQP('reserva.creada', {
      viajeId: viajeId || 'VJ-DESCONOCIDO',
      asiento: String(asiento || '0'),
      pasajero: pasajero || 'Pasajero Anónimo',
      reservaCode: reservaCode || `SMART-${Math.floor(100000 + Math.random() * 900000)}`
    });

    // Publicar log de auditoría
    await publishToCloudAMQP('log.info', {
      nivel: 'info',
      mensaje: `Reserva ${reservaCode || ''} desde Vercel por ${pasajero || 'Pasajero'}`
    });

    return res.status(200).json({
      success: true,
      routed,
      mensaje: '✅ Evento reserva.creada enviado a CloudAMQP',
      patron: '🟢 Pub/Sub Asíncrono'
    });
  } catch (error) {
    console.error('[/api/reserva] Error:', error);
    return res.status(500).json({ 
      error: error?.message || 'Error interno',
      stack: error?.stack 
    });
  }
}
