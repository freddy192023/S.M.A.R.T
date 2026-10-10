package com.smart.messaging.consumer.dlq;

import com.smart.messaging.config.RabbitMQConfig;
import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

/**
 * ☠️ CONSUMIDOR DE DEAD LETTER QUEUE (DLQ) — Dominio: DLQ / Error Recovery
 *
 * Captura todos los mensajes rechazados (NACK) o expirados (TTL) que fueron
 * derivados al Dead Letter Exchange (smart_dlx).
 *
 * Permite monitoreo de fallos catastróficos y reintentos manuales o inspección.
 */
@Service
public class DLQConsumer {

    @RabbitListener(queues = RabbitMQConfig.DEAD_LETTER_Q)
    public void procesarMensajeMuerto(Message message, Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws java.io.IOException {
        String contenido = new String(message.getBody());
        try {
            System.out.println("☠️ [DLQ MONITOR] Mensaje descartado/expirado capturado en DLQ:");
            System.out.println("☠️    Payload: " + contenido);
            System.out.println("☠️    Header x-death: " + message.getMessageProperties().getHeaders().get("x-death"));

            // Hacemos ACK para retirar el mensaje de la DLQ una vez registrado en bitácora de errores
            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            System.err.println("☠️ [DLQ ERROR] Fallo crítico al procesar mensaje muerto: " + e.getMessage());
            channel.basicAck(deliveryTag, false); // ACK forzado para evitar loop infinito en la DLQ
        }
    }
}
