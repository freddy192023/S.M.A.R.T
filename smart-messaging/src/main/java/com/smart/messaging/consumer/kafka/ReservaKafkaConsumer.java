package com.smart.messaging.consumer.kafka;

import com.smart.messaging.config.KafkaConfig;
import com.smart.messaging.dto.ReservaKafkaEvent;
import com.smart.messaging.service.IdempotencyService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

/**
 * 🎟️ CONSUMIDOR KAFKA — Reservas (Bloque 4.4, 4.5, 4.6 & Documento 3.3.3)
 */
@Service
public class ReservaKafkaConsumer {

    private static final Logger log = LoggerFactory.getLogger(ReservaKafkaConsumer.class);

    @Autowired
    private IdempotencyService idempotencyService;

    @KafkaListener(
            topics = KafkaConfig.TOPIC_RESERVAS,
            groupId = "smart-reservas-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void procesarReserva(
            @Payload @Valid ReservaKafkaEvent evento,
            @Header(name = "correlationId", required = false) byte[] correlationIdBytes,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        String correlationId = (correlationIdBytes != null) ?
                new String(correlationIdBytes, StandardCharsets.UTF_8) :
                (evento.getEventoId() != null ? evento.getEventoId() : "N/A");

        MDC.put("correlationId", correlationId);

        try {
            if (idempotencyService.esMensajeDuplicado(evento.getEventoId(), KafkaConfig.TOPIC_RESERVAS, "smart-reservas-group")) {
                log.warn("⚠️ [KAFKA IDEMPOTENCIA] Reserva duplicada detectada (eventoId: {}). Omitiendo.",
                        evento.getEventoId());
                return;
            }

            String threadName = Thread.currentThread().getName();
            log.info("📥 [KAFKA CONSUMER - RESERVAS] Hilo: {} | Partición: {} | Offset: {} | Reserva: {} | Pasajero: {} | Asiento: {} | Tipo: {}",
                    threadName, partition, offset, evento.getReservaId(), evento.getPasajeroNombre(), evento.getAsientoNumero(), evento.getTipoEvento());

            ejecutarLogicaNegocioReserva(evento);
        } finally {
            MDC.remove("correlationId");
        }
    }

    private void ejecutarLogicaNegocioReserva(ReservaKafkaEvent evento) {
        log.info("🎟️ [DOMINIO RESERVAS] Actualizando registro de auditoría y notificación para '{}' (email: {})",
                evento.getPasajeroNombre(), evento.getPasajeroEmail());
    }
}
