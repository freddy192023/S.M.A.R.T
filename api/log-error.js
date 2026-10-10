// api/log-error.js — Vercel Serverless: Simular Error Crítico (log.error)
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
    const nivel = (body.nivel || 'error').toLowerCase();
    const routingKey = nivel === 'error' ? 'log.error' : 'log.info';

    // Publicar log → si es error llega a errors_only_queue, si es info llega a logs_queue
    await publishToCloudAMQP(routingKey, {
      nivel,
      mensaje: body.mensaje || 'Evento registrado en S.M.A.R.T.',
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      ok: true,
      mensaje: `Log (${nivel}) publicado con routing key ${routingKey}.`,
      patron: '🟢 Topic Exchange — Enrutamiento dinámico por nivel'
    });
  } catch (error) {
    console.error('[/api/log-error] Error:', error);
    return res.status(500).json({ error: error?.message || 'Error interno' });
  }
}
