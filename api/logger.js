import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { level, message, user, error } = req.body;
    
    const timestamp = new Date().toISOString();
    const userEmail = user ? user.email : 'Anónimo';
    const logPrefix = `[S.M.A.R.T LOG] [${timestamp}] [${level || 'INFO'}]`;

    if (level === 'ERROR') {
      console.error(`${logPrefix} Usuario: ${userEmail} - Mensaje: ${message}`, error || '');
    } else if (level === 'WARN') {
      console.warn(`${logPrefix} Usuario: ${userEmail} - Mensaje: ${message}`);
    } else {
      console.log(`${logPrefix} Usuario: ${userEmail} - Mensaje: ${message}`);
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
