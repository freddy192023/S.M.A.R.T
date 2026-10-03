// api/lib/rabbitmq.js — CloudAMQP HTTP API Client
const CLOUDAMQP_HOST = 'shark.rmq.cloudamqp.com';
const CLOUDAMQP_VHOST = 'upzhvdpi';
const CLOUDAMQP_USER = 'upzhvdpi';
const CLOUDAMQP_PASS = 'uQeQBUACo1mXOIuYq2Rta87dczLjEkHa';

const AUTH_HEADER = 'Basic ' + Buffer.from(`${CLOUDAMQP_USER}:${CLOUDAMQP_PASS}`).toString('base64');

export async function publishToCloudAMQP(routingKey, payload) {
  const exchange = 's.m.a.r.t_exchange';
  const publishUrl = `https://${CLOUDAMQP_HOST}/api/exchanges/${encodeURIComponent(CLOUDAMQP_VHOST)}/${encodeURIComponent(exchange)}/publish`;

  const body = {
    routing_key: routingKey,
    payload: JSON.stringify({
      ...payload,
      timestamp: new Date().toISOString(),
      source: 'Vercel-Serverless'
    }),
    payload_encoding: 'string',
    properties: {
      content_type: 'application/json',
      delivery_mode: 2
    }
  };

  console.log(`[CloudAMQP] Publishing to: ${publishUrl}`);
  console.log(`[CloudAMQP] Routing key: ${routingKey}`);

  const response = await fetch(publishUrl, {
    method: 'POST',
    headers: {
      'Authorization': AUTH_HEADER,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const responseText = await response.text();
  console.log(`[CloudAMQP] Response ${response.status}: ${responseText}`);

  if (!response.ok) {
    throw new Error(`CloudAMQP HTTP ${response.status}: ${responseText}`);
  }

  try {
    const data = JSON.parse(responseText);
    return data.routed;
  } catch {
    return true; // Si no es JSON pero fue 200, asumimos éxito
  }
}
