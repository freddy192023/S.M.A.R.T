package com.smart.messaging.consumer.trip;

import com.smart.messaging.config.RabbitMQConfig;
import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

/**
 * 🟢 CONSUMIDOR DE VIAJES — Dominio: Trip / Viajes
 *
 * Se activa cuando el administrador programa un nuevo viaje.
 * Notifica al conductor asignado sobre su próximo viaje.
 *
 * Routing key: "viaje.programado" → viaje_programado_queue
 * ACK Manual y NACK sin requeue para envío a DLQ en caso de fallo.
 */
@Service
public class ViajeEventConsumer {

    @RabbitListener(queues = RabbitMQConfig.VIAJE_PROGRAMADO_Q)
    public void notificarConductor(Message message, Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws java.io.IOException {
        String viajeJson = new String(message.getBody());
        try {
            System.out.println("[CONDUCTOR] 🚍 Nuevo viaje programado:");
            System.out.println("[CONDUCTOR]    " + viajeJson);
            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            System.out.println("[CONDUCTOR] ❌ Error al notificar conductor: " + e.getMessage());
            channel.basicNack(deliveryTag, false, false);
        }
    }
}
