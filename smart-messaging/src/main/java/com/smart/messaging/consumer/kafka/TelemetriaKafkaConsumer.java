package com.smart.messaging.consumer.kafka;

import com.smart.messaging.config.KafkaConfig;
import com.smart.messaging.dto.TelemetriaBusEvent;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

/**
 * 📡 CONSUMIDOR KAFKA — Telemetría IoT (Bloque 4.4, 4.6 & Documento 3.3.3)
 */
@Service
public class TelemetriaKafkaConsumer {

    private static final Logger log = LoggerFactory.getLogger(TelemetriaKafkaConsumer.class);
    private static final double LIMITE_VELOCIDAD_MAX = 100.0; // km/h

    @KafkaListener(
            topics = KafkaConfig.TOPIC_TELEMETRIA,
            groupId = "smart-telemetria-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void procesarTelemetria(
            @Payload @Valid TelemetriaBusEvent evento,
            @Header(name = "correlationId", required = false) byte[] correlationIdBytes,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        String correlationId = (correlationIdBytes != null) ?
                new String(correlationIdBytes, StandardCharsets.UTF_8) :
                (evento.getEventoId() != null ? evento.getEventoId() : "N/A");

        MDC.put("correlationId", correlationId);

        try {
            String threadName = Thread.currentThread().getName();
            log.debug("📡 [KAFKA CONSUMER - TELEMETRIA] Hilo: {} | P:{} O:{} | Bus: {} | Vel: {} km/h | Alerta: {}",
                    threadName, partition, offset, evento.getBusId(), evento.getVelocidadKmh(), evento.getAlerta());

            if (evento.getVelocidadKmh() > LIMITE_VELOCIDAD_MAX) {
                log.warn("🚨 [ALERTA DE SEGURIDAD VIAL] Bus '{}' excede velocidad máxima: {} km/h (límite: {} km/h) en coordenadas [{}, {}]",
                        evento.getBusId(), evento.getVelocidadKmh(), LIMITE_VELOCIDAD_MAX, evento.getLatitud(), evento.getLongitud());
            }
        } finally {
            MDC.remove("correlationId");
        }
    }
}
