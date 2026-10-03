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

    // Publicar log.error → llega a logs_queue Y a errors_only_queue (doble consumo)
    await publishToCloudAMQP('log.error', {
      nivel: 'error',
      mensaje: body.mensaje || 'Error crítico simulado en S.M.A.R.T.',
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      ok: true,
      mensaje: '🚨 Error crítico publicado. Llega a logs_queue + errors_only_queue.',
      patron: '🟢 Topic Exchange — Doble consumo con wildcard'
    });
  } catch (error) {
    console.error('[/api/log-error] Error:', error);
    return res.status(500).json({ error: error?.message || 'Error interno' });
  }
}
