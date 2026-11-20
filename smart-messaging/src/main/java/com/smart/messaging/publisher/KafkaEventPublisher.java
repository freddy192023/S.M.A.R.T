package com.smart.messaging.publisher;

import com.smart.messaging.config.KafkaConfig;
import com.smart.messaging.dto.ReservaKafkaEvent;
import com.smart.messaging.dto.TelemetriaBusEvent;
import com.smart.messaging.dto.ViajeKafkaEvent;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * ⚡ PRODUCTOR DE EVENTOS KAFKA (Bloque 4.3 & Documento 3.3.3)
 *
 * Envía eventos a los tópicos configurados utilizando DTOs tipados.
 * Aplica inyección de Correlation ID en los headers de Kafka y en el contexto
 * de logs MDC para trazabilidad distribuida extremo a extremo.
 */
@Service
public class KafkaEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(KafkaEventPublisher.class);
    public static final String CORRELATION_ID_HEADER = "correlationId";

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Publica evento de viaje en smart.viajes con Correlation ID.
     */
    public CompletableFuture<SendResult<String, Object>> publicarViaje(ViajeKafkaEvent evento) {
        String key = evento.getViajeId();
        String correlationId = (evento.getEventoId() != null) ? evento.getEventoId() : UUID.randomUUID().toString();
        log.info("🚀 [KAFKA PUBLISH] Publicando viaje '{}' en tópico '{}'", key, KafkaConfig.TOPIC_VIAJES);
        return enviarConCorrelationId(KafkaConfig.TOPIC_VIAJES, key, evento, correlationId);
    }

    /**
     * Publica evento de reserva en smart.reservas con Correlation ID.
     */
    public CompletableFuture<SendResult<String, Object>> publicarReserva(ReservaKafkaEvent evento) {
        String key = evento.getReservaId();
        String correlationId = (evento.getEventoId() != null) ? evento.getEventoId() : UUID.randomUUID().toString();
        log.info("🚀 [KAFKA PUBLISH] Publicando reserva '{}' en tópico '{}'", key, KafkaConfig.TOPIC_RESERVAS);
        return enviarConCorrelationId(KafkaConfig.TOPIC_RESERVAS, key, evento, correlationId);
    }

    /**
     * Publica evento de telemetría IoT en smart.telemetria con Correlation ID.
     */
    public CompletableFuture<SendResult<String, Object>> publicarTelemetria(TelemetriaBusEvent evento) {
        String key = evento.getBusId();
        String correlationId = (evento.getEventoId() != null) ? evento.getEventoId() : UUID.randomUUID().toString();
        log.debug("📡 [KAFKA PUBLISH] Telemetría bus '{}': {} km/h", key, evento.getVelocidadKmh());
        return enviarConCorrelationId(KafkaConfig.TOPIC_TELEMETRIA, key, evento, correlationId);
    }

    /**
     * Publicación genérica directa con Correlation ID y registro en MDC.
     */
    public CompletableFuture<SendResult<String, Object>> enviar(String topic, String key, Object payload) {
        String correlationId = UUID.randomUUID().toString();
        return enviarConCorrelationId(topic, key, payload, correlationId);
    }

    /**
     * Envío enriqueciendo headers con Correlation ID (Documento 3.3.3).
     */
    public CompletableFuture<SendResult<String, Object>> enviarConCorrelationId(String topic, String key, Object payload, String correlationId) {
        MDC.put("correlationId", correlationId);
        try {
            ProducerRecord<String, Object> record = new ProducerRecord<>(topic, key, payload);
            record.headers().add(CORRELATION_ID_HEADER, correlationId.getBytes(StandardCharsets.UTF_8));

            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(record);

            future.whenComplete((result, ex) -> {
                MDC.put("correlationId", correlationId);
                try {
                    if (ex == null) {
                        log.info("✅ [KAFKA SUCCESS] Evento publicado en [{}] | Partición: {} | Offset: {} | Key: {}",
                                topic,
                                result.getRecordMetadata().partition(),
                                result.getRecordMetadata().offset(),
                                key);
                    } else {
                        log.error("❌ [KAFKA ERROR] Error al publicar en [{}] con key [{}]: {}",
                                topic, key, ex.getMessage());
                    }
                } finally {
                    MDC.remove("correlationId");
                }
            });

            return future;
        } finally {
            MDC.remove("correlationId");
        }
    }
}
