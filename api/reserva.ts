import type { VercelRequest, VercelResponse } from '@vercel/node';
import { publishEventToRabbitMQ } from './lib/rabbitmq';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Manejo de CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  try {
    const body = req.body || {};
    const { viajeId, asiento, pasajero, reservaCode } = body;

    // Publicar evento "reserva.creada" a CloudAMQP
    const ok = await publishEventToRabbitMQ('reserva.creada', {
      viajeId: viajeId || 'VJ-DESCONOCIDO',
      asiento: asiento || '0',
      pasajero: pasajero || 'Pasajero Anónimo',
      reservaCode: reservaCode || `SMART-${Math.floor(100000 + Math.random() * 900000)}`
    });

    // Publicar también un log de auditoría
    await publishEventToRabbitMQ('log.info', {
      nivel: 'info',
      mensaje: `Reserva ${reservaCode || ''} confirmada desde Vercel por ${pasajero || 'Pasajero'}`
    });

    return res.status(200).json({
      success: ok,
      mensaje: '✅ Evento reserva.creada enviado exitosamente a CloudAMQP (Vercel Serverless)',
      patron: '🟢 Pub/Sub Asíncrono en Vercel Cloud'
    });
  } catch (error: any) {
    console.error('[Vercel Function /api/reserva] Error:', error);
    return res.status(500).json({ error: error?.message || 'Error interno' });
  }
}
