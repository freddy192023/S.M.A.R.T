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
    const { viajeId, asiento, pasajero } = body;

    if (!viajeId || !asiento || !pasajero) {
      return res.status(400).json({ error: 'Campos requeridos: viajeId, asiento, pasajero' });
    }

    // 1. Simulación síncrona RPC en Vercel (Verificación de Asiento)
    const isOccupied = String(asiento) === '9999'; // Simulación de bloqueo
    if (isOccupied) {
      return res.status(400).json({
        mensaje: `❌ Asiento ${asiento} ya está ocupado (Verificación síncrona RPC)`
      });
    }

    // 2. Publicación de eventos a CloudAMQP (Pub/Sub Asíncrono)
    await publishEventToRabbitMQ('reserva.creada', {
      viajeId,
      asiento,
      pasajero,
      reservaCode: `SMART-${Math.floor(100000 + Math.random() * 900000)}`
    });

    await publishEventToRabbitMQ('log.info', {
      nivel: 'info',
      mensaje: `Reserva confirmada en Vercel para ${pasajero} en asiento ${asiento}`
    });

    return res.status(200).json({
      ok: true,
      mensaje: '✅ Reserva confirmada. Email y PDF generándose en background.',
      asiento,
      viajeId,
      pasajero,
      patron: '🔵 RPC Síncrono (verificación) + 🟢 Pub/Sub Asíncrono (post-procesos)'
    });
  } catch (error: any) {
    console.error('[Vercel Function /api/confirmar] Error:', error);
    return res.status(500).json({ error: error?.message || 'Error interno' });
  }
}
