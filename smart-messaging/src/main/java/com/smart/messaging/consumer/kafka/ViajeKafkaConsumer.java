package com.smart.messaging.consumer.kafka;

import com.smart.messaging.config.KafkaConfig;
import com.smart.messaging.dto.ViajeKafkaEvent;
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
 * 🚌 CONSUMIDOR KAFKA — Viajes (Bloque 4.4, 4.5, 4.6 & Documento 3.3.3)
 *
 * Características avanzadas:
 *  1. Validación JSR-380 en consumo con @Valid sobre el DTO.
 *  2. Trazabilidad con Correlation ID y MDC.
 *  3. Idempotencia persistente en base de datos mediante IdempotencyService.
 *  4. Demostración de balanceo con registro de hilo concurrente.
 */
@Service
public class ViajeKafkaConsumer {

    private static final Logger log = LoggerFactory.getLogger(ViajeKafkaConsumer.class);

    @Autowired
    private IdempotencyService idempotencyService;

    @KafkaListener(
            topics = KafkaConfig.TOPIC_VIAJES,
            groupId = "smart-viajes-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void procesarViaje(
            @Payload @Valid ViajeKafkaEvent evento,
            @Header(name = "correlationId", required = false) byte[] correlationIdBytes,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        String correlationId = (correlationIdBytes != null) ?
                new String(correlationIdBytes, StandardCharsets.UTF_8) :
                (evento.getEventoId() != null ? evento.getEventoId() : "N/A");

        MDC.put("correlationId", correlationId);

        try {
            // Control de Idempotencia Persistente en BD (Documento 3.3.3)
            if (idempotencyService.esMensajeDuplicado(evento.getEventoId(), KafkaConfig.TOPIC_VIAJES, "smart-viajes-group")) {
                log.warn("⚠️ [KAFKA IDEMPOTENCIA] Evento viaje duplicado detectado (eventoId: {}). Se omite procesamiento.",
                        evento.getEventoId());
                return;
            }

            // Registro de partición e hilo asignado (Indicador 8: Balanceo concurrente)
            String threadName = Thread.currentThread().getName();
            log.info("📥 [KAFKA CONSUMER - VIAJES] Hilo: {} | Partición: {} | Offset: {} | Viaje: {} | Bus: {} | Estado: {}",
                    threadName, partition, offset, evento.getViajeId(), evento.getBusId(), evento.getEstado());

            ejecutarLogicaNegocioViaje(evento);
        } finally {
            MDC.remove("correlationId");
        }
    }

    private void ejecutarLogicaNegocioViaje(ViajeKafkaEvent evento) {
        log.info("🎯 [DOMINIO VIAJES] Sincronizando estado operativo del viaje '{}' en ruta '{}' -> '{}'",
                evento.getViajeId(), evento.getOrigen(), evento.getDestino());
    }
}
