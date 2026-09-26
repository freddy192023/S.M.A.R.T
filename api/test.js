// api/test.js — Vercel Serverless Function (test endpoint)
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ 
    ok: true, 
    message: 'Vercel function is alive!',
    time: new Date().toISOString()
  });
}
