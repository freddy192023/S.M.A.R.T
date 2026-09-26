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
    public void monitorGeneral(String mensaje) {
        System.out.println("[MONITOR] 📊 " + mensaje);
    }

    /**
     * Alerta crítica: recibe SOLO los errores.
     * Activa protocolo de urgencia: SMS, Slack, PagerDuty, etc.
     * Routing key "log.error" → errors_only_queue (binding exclusivo).
     */
    @RabbitListener(queues = "errors_only_queue")
    public void alertaCritica(String mensaje) {
        System.out.println("╔════════════════════════════════════════╗");
        System.out.println("║  🚨 [ALERTA CRÍTICA S.M.A.R.T]        ║");
        System.out.println("║  " + mensaje);
        System.out.println("╚════════════════════════════════════════╝");
        // TODO: smsService.send(adminPhone, "ALERTA: " + mensaje);
        // TODO: slackWebhook.notify("#alertas", mensaje);
    }
}
