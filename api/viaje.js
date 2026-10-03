// api/viaje.js — Vercel Serverless: Programar Viaje (Pub/Sub)
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
    const { viajeId, ruta, conductor, fecha } = body;

    console.log('[/api/viaje] Recibido:', JSON.stringify(body));

    // Publicar evento viaje.programado
    await publishToCloudAMQP('viaje.programado', {
      viajeId: viajeId || `VJ-${Math.floor(1000 + Math.random() * 9000)}`,
      ruta: ruta || 'Santiago - Valparaíso',
      conductor: conductor || 'Conductor Asignado',
      fecha: fecha || new Date().toISOString()
    });

    // Publicar log
    await publishToCloudAMQP('log.info', {
      nivel: 'info',
      mensaje: `Viaje programado: ${ruta || 'Santiago - Valparaíso'} con conductor ${conductor || 'N/A'}`
    });

    return res.status(200).json({
      ok: true,
      mensaje: '🚍 Viaje programado. Conductor notificado vía CloudAMQP.',
      patron: '🟢 Pub/Sub Asíncrono'
    });
  } catch (error) {
    console.error('[/api/viaje] Error:', error);
    return res.status(500).json({ error: error?.message || 'Error interno' });
  }
}
