package com.smart.messaging.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

/**
 * 🟢 CONSUMIDOR DE VIAJES — ViajeEventConsumer
 *
 * Se activa cuando el administrador programa un nuevo viaje.
 * Notifica al conductor asignado sobre su próximo viaje.
 *
 * Routing key: "viaje.programado" → viaje_programado_queue
 *
 * En producción: integrar notificaciones push, email al conductor,
 * o integración con el dashboard del conductor en S.M.A.R.T.
 */
@Service
public class ViajeEventConsumer {

    @RabbitListener(queues = "viaje_programado_queue")
    public void notificarConductor(org.springframework.amqp.core.Message message, com.rabbitmq.client.Channel channel) throws java.io.IOException {
        String viajeJson = new String(message.getBody());
        try {
            System.out.println("[CONDUCTOR] \uD83D\uDE8D Nuevo viaje programado:");
            System.out.println("[CONDUCTOR]    " + viajeJson);
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception e) {
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
        }
    }
}
