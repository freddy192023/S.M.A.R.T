import amqp from 'amqplib';

const CLOUDAMQP_URL = process.env.CLOUDAMQP_URL || 'amqps://upzhvdpi:uQeQBUACo1mXOIuYq2Rta87dczLjEkHa@shark.rmq.cloudamqp.com/upzhvdpi';

export async function publishEventToRabbitMQ(routingKey: string, payload: Record<string, unknown>): Promise<boolean> {
  let connection: amqp.Connection | null = null;
  let channel: amqp.Channel | null = null;

  try {
    // 1. Conectar a CloudAMQP en la nube
    connection = await amqp.connect(CLOUDAMQP_URL);
    channel = await connection.createChannel();

    const EXCHANGE_NAME = 'smart.events';
    const QUEUE_EMAIL = 'smart.reserva.email';
    const QUEUE_PDF = 'smart.reserva.pdf';
    const QUEUE_AUDIT = 'smart.reserva.audit';
    const QUEUE_LOGS = 'smart.logs';

    // 2. Asegurar Exchange de Topic
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    // 3. Asegurar Colas y Binds
    await channel.assertQueue(QUEUE_EMAIL, { durable: true });
    await channel.assertQueue(QUEUE_PDF, { durable: true });
    await channel.assertQueue(QUEUE_AUDIT, { durable: true });
    await channel.assertQueue(QUEUE_LOGS, { durable: true });

    await channel.bindQueue(QUEUE_EMAIL, EXCHANGE_NAME, 'reserva.creada');
    await channel.bindQueue(QUEUE_PDF, EXCHANGE_NAME, 'reserva.creada');
    await channel.bindQueue(QUEUE_AUDIT, EXCHANGE_NAME, 'reserva.#');
    await channel.bindQueue(QUEUE_LOGS, EXCHANGE_NAME, 'log.#');

    // 4. Publicar mensaje
    const messageBuffer = Buffer.from(JSON.stringify({
      ...payload,
      timestamp: new Date().toISOString(),
      source: 'Vercel Serverless Function'
    }));

    const published = channel.publish(EXCHANGE_NAME, routingKey, messageBuffer, {
      contentType: 'application/json',
      timestamp: Date.now()
    });

    console.log(`[RabbitMQ Vercel] ✅ Evento '${routingKey}' publicado a CloudAMQP`);

    // Limpieza de canal y conexión
    await channel.close();
    await connection.close();

    return published;
  } catch (error) {
    console.error('[RabbitMQ Vercel] ❌ Error conectando a CloudAMQP:', error);
    if (channel) try { await channel.close(); } catch {}
    if (connection) try { await connection.close(); } catch {}
    return false;
  }
}
