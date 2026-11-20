package com.smart.messaging.consumer.kafka;

import com.smart.messaging.config.KafkaConfig;
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
 * ☠️ CONSUMIDOR DE DEAD LETTER TOPICS (DLT) — Kafka Error Recovery (Bloque 4.5 & Doc 3.3.3)
 */
@Service
public class KafkaDltConsumer {

    private static final Logger log = LoggerFactory.getLogger(KafkaDltConsumer.class);

    @KafkaListener(
            topics = {
                    KafkaConfig.TOPIC_VIAJES_DLT,
                    KafkaConfig.TOPIC_RESERVAS_DLT,
                    KafkaConfig.TOPIC_TELEMETRIA_DLT
            },
            groupId = "smart-dlt-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void procesarMensajeMuerto(
            @Payload Object payload,
            @Header(name = "correlationId", required = false) byte[] correlationIdBytes,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        String correlationId = (correlationIdBytes != null) ?
                new String(correlationIdBytes, StandardCharsets.UTF_8) : "DLT-UNKNOWN";

        MDC.put("correlationId", correlationId);

        try {
            log.error("☠️ [KAFKA DLT CONSUMER] Mensaje anómalo desviado a [{}] Partición: {} | Offset: {} | Payload: {}",
                    topic, partition, offset, payload);
            log.error("☠️ [KAFKA DLT AUDITORIA] Evento anómalo registrado en bitácora para aislamiento de incidentes.");
        } finally {
            MDC.remove("correlationId");
        }
    }
}
