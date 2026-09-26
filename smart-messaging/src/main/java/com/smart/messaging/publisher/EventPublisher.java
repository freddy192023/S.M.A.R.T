package com.smart.messaging.publisher;

import com.smart.messaging.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 🟢 PRODUCTOR ASÍNCRONO — EventPublisher
 *
 * Publica mensajes al Topic Exchange de S.M.A.R.T.
 * El hilo del llamador retorna INMEDIATAMENTE después de publicar.
 * Los consumidores procesan el mensaje en background de forma independiente.
 *
 * Patrón: Fire-and-Forget / Pub-Sub
 *
 * Integración con el frontend React:
 *   POST /api/events/reserva      → reservaCreada()
 *   POST /api/events/cancelacion  → reservaCancelada()
 *   POST /api/events/viaje        → viajeProgramado()
 *   POST /api/events/log          → logInfo() / logWarning() / logError()
 */
@Service
public class EventPublisher {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    /**
     * Método base de publicación.
     * @param routingKey  Clave de enrutamiento (ej: "reserva.creada", "log.error")
     * @param payload     Objeto a publicar (se serializa a JSON automáticamente)
     */
    public void publicar(String routingKey, Object payload) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, routingKey, payload);
        System.out.println("[SMART-ASYNC] ✅ Evento publicado → " + routingKey + " | payload: " + payload);
    }

    // ── Eventos de reservas ───────────────────────────────────────────────────

    /** Publica evento cuando se crea una reserva (→ email + PDF + auditoría) */
    public void reservaCreada(Object reserva) {
        publicar("reserva.creada", reserva);
    }

    /** Publica evento cuando se cancela una reserva (→ liberar asiento) */
    public void reservaCancelada(Object reserva) {
        publicar("reserva.cancelada", reserva);
    }

    /** Publica evento cuando se programa un viaje (→ notificar conductor) */
    public void viajeProgramado(Object viaje) {
        publicar("viaje.programado", viaje);
    }

    // ── Logs del sistema (guía 2.1.3) ────────────────────────────────────────

    /** Log informativo — llega solo a logs_queue */
    public void logInfo(String mensaje) {
        publicar("log.info", mensaje);
    }

    /** Advertencia — llega solo a logs_queue */
    public void logWarning(String mensaje) {
        publicar("log.warning", mensaje);
    }

    /** Error crítico — llega a logs_queue Y a errors_only_queue (doble consumo) */
    public void logError(String mensaje) {
        publicar("log.error", mensaje);
    }
}
