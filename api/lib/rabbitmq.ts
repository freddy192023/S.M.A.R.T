const CLOUDAMQP_HOST = 'shark.rmq.cloudamqp.com';
const CLOUDAMQP_VHOST = 'upzhvdpi';
const CLOUDAMQP_USER = 'upzhvdpi';
const CLOUDAMQP_PASS = 'uQeQBUACo1mXOIuYq2Rta87dczLjEkHa';

const AUTH_HEADER = 'Basic ' + Buffer.from(`${CLOUDAMQP_USER}:${CLOUDAMQP_PASS}`).toString('base64');

export async function publishEventToRabbitMQ(routingKey: string, payload: Record<string, unknown>): Promise<boolean> {
  try {
    const exchange = routingKey.startsWith('log') ? 'smart.events' : 'smart.events';

    // Asegurar que exista la cola y binding si es necesario
    const publishUrl = `https://${CLOUDAMQP_HOST}/api/exchanges/${CLOUDAMQP_VHOST}/${exchange}/publish`;

    const body = {
      routing_key: routingKey,
      payload: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        source: 'Vercel Serverless Cloud'
      }),
      payload_encoding: 'string',
      properties: {
        content_type: 'application/json',
        delivery_mode: 2
      }
    };

    const response = await fetch(publishUrl, {
      method: 'POST',
      headers: {
        'Authorization': AUTH_HEADER,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[CloudAMQP HTTP] Error ${response.status}:`, errText);
      return false;
    }

    const data = await response.json() as { routed: boolean };
    console.log(`[CloudAMQP HTTP] ✅ Evento '${routingKey}' publicado exitosamente. routed=${data.routed}`);
    return data.routed;
  } catch (error) {
    console.error('[CloudAMQP HTTP] Error publicando evento:', error);
    return false;
  }
}
