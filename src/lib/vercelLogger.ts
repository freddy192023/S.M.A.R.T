// Utilidad para enviar logs del cliente al endpoint del servidor en Vercel

export const vercelLogger = {
  log: async (message: string, user?: any) => {
    send('INFO', message, user);
  },
  warn: async (message: string, user?: any) => {
    send('WARN', message, user);
  },
  error: async (message: string, error?: any, user?: any) => {
    send('ERROR', message, user, error);
  }
};

async function send(level: string, message: string, user?: any, error?: any) {
  try {
    // Detectar si estamos en producción (Vercel) o local
    const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? ''
      : `${window.location.protocol}//${window.location.host}`;

    fetch(`${baseUrl}/api/logger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level,
        message,
        user: user ? { email: user.email } : undefined,
        error: error ? (error.message || String(error)) : undefined
      })
    }).catch(() => {
      // Ignorar de forma silenciosa si falla el log, para no interrumpir el flujo del usuario
    });
  } catch (e) {
    // Silencioso
  }
}
export default vercelLogger;
