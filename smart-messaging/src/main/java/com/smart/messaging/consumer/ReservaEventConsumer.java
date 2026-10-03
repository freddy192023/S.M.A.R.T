package com.smart.messaging.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

/**
 * 🟢 CONSUMIDORES ASÍNCRONOS — ReservaEventConsumer
 *
 * Demuestra el patrón Pub/Sub de RabbitMQ:
 * UN solo mensaje "reserva.creada" activa TRES consumidores en PARALELO.
 *
 * Esto es posible porque se declaran 3 métodos escuchando la misma cola.
 * RabbitMQ distribuye los mensajes entre todos los consumidores activos.
 *
 * Flujo real de reserva en S.M.A.R.T:
 *   1. Frontend llama a POST /api/reservations/confirmar
 *   2. RPC verifica asiento (síncrono — bloquea)
 *   3. Si disponible → publica "reserva.creada" (asíncrono — no bloquea)
 *   4. Este consumer dispara email + PDF + auditoría en paralelo
 *   5. El usuario ya recibió respuesta en el paso 2
 */
@Service
public class ReservaEventConsumer {

    /**
     * Consumidor 1: Envía email de confirmación al pasajero.
     * En producción: integrar SendGrid, Mailgun o JavaMailSender.
     */
    @RabbitListener(queues = {"reserva_creada_queue", "smart.reserva.email"})
    public void enviarEmailConfirmacion(org.springframework.amqp.core.Message message, com.rabbitmq.client.Channel channel) throws java.io.IOException {
        String reservaJson = new String(message.getBody());
        try {
            System.out.println("[EMAIL] ✉  Enviando confirmación al pasajero...");
            System.out.println("[EMAIL]    Datos de reserva: " + reservaJson);
            // TODO: emailService.send(...)
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception e) {
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false); // false requeue manda al DLX
        }
    }

    @RabbitListener(queues = "reserva_creada_queue")
    public void generarComprobantePDF(org.springframework.amqp.core.Message message, com.rabbitmq.client.Channel channel) throws java.io.IOException {
        String reservaJson = new String(message.getBody());
        try {
            System.out.println("[PDF] 📄 Generando comprobante de reserva...");
            System.out.println("[PDF]    Datos de reserva: " + reservaJson);
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception e) {
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
        }
    }

    @RabbitListener(queues = "reserva_creada_queue")
    public void registrarAuditoria(org.springframework.amqp.core.Message message, com.rabbitmq.client.Channel channel) throws java.io.IOException {
        String reservaJson = new String(message.getBody());
        try {
            System.out.println("[AUDITORIA] 📝 Registrando reserva en bitácora...");
            System.out.println("[AUDITORIA]    " + reservaJson);
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception e) {
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
        }
    }

    @RabbitListener(queues = "reserva_cancelada_queue")
    public void liberarAsiento(org.springframework.amqp.core.Message message, com.rabbitmq.client.Channel channel) throws java.io.IOException {
        String reservaJson = new String(message.getBody());
        try {
            System.out.println("[ASIENTO] 🔓 Liberando asiento de reserva cancelada...");
            System.out.println("[ASIENTO]    " + reservaJson);
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception e) {
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
        }
    }
}
