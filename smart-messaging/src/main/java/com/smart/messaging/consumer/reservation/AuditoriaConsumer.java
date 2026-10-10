package com.smart.messaging.consumer.reservation;

import com.smart.messaging.config.RabbitMQConfig;
import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

/**
 * 📝 CONSUMIDOR DE AUDITORÍA — Dominio: Reservas
 *
 * Registra cada reserva en la bitácora del sistema para
 * trazabilidad y cumplimiento normativo.
 *
 * ACK Manual: confirma procesamiento exitoso al broker.
 * NACK sin requeue: mensajes fallidos van al DLX → DLQ.
 */
@Service
public class AuditoriaConsumer {

    @RabbitListener(queues = RabbitMQConfig.RESERVA_CREADA_Q)
    public void registrarAuditoria(Message message, Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws java.io.IOException {
        String reservaJson = new String(message.getBody());
        try {
            System.out.println("[AUDITORIA] 📝 Registrando reserva en bitácora...");
            System.out.println("[AUDITORIA]    " + reservaJson);
            // TODO: auditoriaService.registrar(...)
            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            System.out.println("[AUDITORIA] ❌ Error al registrar en bitácora: " + e.getMessage());
            channel.basicNack(deliveryTag, false, false);
        }
    }
}
