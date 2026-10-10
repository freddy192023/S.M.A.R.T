package com.smart.messaging.consumer.reservation;

import com.smart.messaging.config.RabbitMQConfig;
import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

/**
 * 🔓 CONSUMIDOR DE ASIENTOS — Dominio: Reservas
 *
 * Escucha cancelaciones de reservas y libera el asiento
 * para que otros pasajeros puedan reservarlo.
 *
 * ACK Manual: confirma procesamiento exitoso al broker.
 * NACK sin requeue: mensajes fallidos van al DLX → DLQ.
 */
@Service
public class AsientoConsumer {

    @RabbitListener(queues = RabbitMQConfig.RESERVA_CANCEL_Q)
    public void liberarAsiento(Message message, Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws java.io.IOException {
        String reservaJson = new String(message.getBody());
        try {
            System.out.println("[ASIENTO] 🔓 Liberando asiento de reserva cancelada...");
            System.out.println("[ASIENTO]    " + reservaJson);
            // TODO: asientoService.liberar(...)
            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            System.out.println("[ASIENTO] ❌ Error al liberar asiento: " + e.getMessage());
            channel.basicNack(deliveryTag, false, false);
        }
    }
}
