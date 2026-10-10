package com.smart.messaging.consumer.monitoring;

import com.smart.messaging.config.RabbitMQConfig;
import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

/**
 * 🟢 CONSUMIDOR DE LOGS — Dominio: Monitoring / Auditoría de Logs
 *
 * Implementa el patrón de la guía 2.1.3: dos consumidores reaccionan
 * al mismo mensaje "log.error" simultáneamente gracias al Topic Exchange.
 *
 * Topología:
 *   log.info    → logs_queue (1 consumidor)
 *   log.warning → logs_queue (1 consumidor)
 *   log.error   → logs_queue (1 consumidor)         ← monitorGeneral
 *               → errors_only_queue (1 consumidor)  ← alertaCritica
 */
@Service
public class LogConsumer {

    /**
     * Monitor general: recibe TODOS los logs (info, warning, error).
     */
    @RabbitListener(queues = RabbitMQConfig.LOGS_Q)
    public void monitorGeneral(Message message, Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws java.io.IOException {
        String mensaje = new String(message.getBody());
        try {
            System.out.println("[MONITOR] 📊 " + mensaje);
            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            channel.basicNack(deliveryTag, false, false);
        }
    }

    /**
     * Alerta crítica: recibe ÚNICAMENTE los logs de nivel error.
     */
    @RabbitListener(queues = RabbitMQConfig.ERRORS_Q)
    public void alertaCritica(Message message, Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws java.io.IOException {
        String mensaje = new String(message.getBody());
        try {
            System.out.println("╔════════════════════════════════════════╗");
            System.out.println("║  🚨 [ALERTA CRÍTICA S.M.A.R.T]        ║");
            System.out.println("║  " + mensaje);
            System.out.println("╚════════════════════════════════════════╝");
            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            channel.basicNack(deliveryTag, false, false);
        }
    }
}
