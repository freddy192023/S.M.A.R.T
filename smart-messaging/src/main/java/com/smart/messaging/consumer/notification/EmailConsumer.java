package com.smart.messaging.consumer.notification;

import com.smart.messaging.config.RabbitMQConfig;
import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

/**
 * 📧 CONSUMIDOR DE EMAIL — Dominio: Notificaciones
 *
 * Escucha las colas de reserva creada y email dedicado.
 * En producción: integrar SendGrid, Mailgun o JavaMailSender.
 *
 * ACK Manual: confirma procesamiento exitoso al broker.
 * NACK sin requeue: mensajes fallidos van al DLX → DLQ.
 */
@Service
public class EmailConsumer {

    @RabbitListener(queues = {RabbitMQConfig.RESERVA_CREADA_Q, RabbitMQConfig.SMART_EMAIL_Q})
    public void enviarEmailConfirmacion(Message message, Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws java.io.IOException {
        String reservaJson = new String(message.getBody());
        try {
            System.out.println("[EMAIL] ✉  Enviando confirmación al pasajero...");
            System.out.println("[EMAIL]    Datos de reserva: " + reservaJson);
            // TODO: emailService.send(...)
            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            System.out.println("[EMAIL] ❌ Error al enviar email: " + e.getMessage());
            channel.basicNack(deliveryTag, false, false); // false requeue → va al DLX
        }
    }
}
