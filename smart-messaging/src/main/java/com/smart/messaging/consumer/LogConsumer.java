package com.smart.messaging.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

/**
 * 🟢 CONSUMIDOR DE LOGS — LogConsumer
 *
 * Implementa el patrón de la guía 2.1.3: dos consumidores reaccionan
 * al mismo mensaje "log.error" simultáneamente gracias al Topic Exchange.
 *
 * Topología:
 *   log.info    → logs_queue (1 consumidor)
 *   log.warning → logs_queue (1 consumidor)
 *   log.error   → logs_queue (1 consumidor)  ← monitorGeneral
 *               → errors_only_queue (1 consumidor)  ← alertaCritica
 *
 * El mismo mensaje de error llega a DOS colas distintas.
 * Esto es el poder del Topic Exchange con routing keys superpuestos.
 */
@Service
public class LogConsumer {

    /**
     * Monitor general: recibe TODOS los logs (info, warning, error).
     * Routing key "log.*" captura cualquier nivel.
     */
    @RabbitListener(queues = "logs_queue")
    public void monitorGeneral(org.springframework.amqp.core.Message message, com.rabbitmq.client.Channel channel) throws java.io.IOException {
        String mensaje = new String(message.getBody());
        try {
            System.out.println("[MONITOR] \uD83D\uDCCA " + mensaje);
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception e) {
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
        }
    }

    @RabbitListener(queues = "errors_only_queue")
    public void alertaCritica(org.springframework.amqp.core.Message message, com.rabbitmq.client.Channel channel) throws java.io.IOException {
        String mensaje = new String(message.getBody());
        try {
            System.out.println("╔════════════════════════════════════════╗");
            System.out.println("║  \uD83D\uDEA8 [ALERTA CRÍTICA S.M.A.R.T]        ║");
            System.out.println("║  " + mensaje);
            System.out.println("╚════════════════════════════════════════╝");
            channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
        } catch (Exception e) {
            channel.basicNack(message.getMessageProperties().getDeliveryTag(), false, false);
        }
    }
}
