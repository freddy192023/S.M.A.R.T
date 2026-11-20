package com.smart.messaging.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;

/**
 * 🔒 SERVICIO DE IDEMPOTENCIA PERSISTENTE (Documento 3.3.3 & Indicador 6)
 *
 * Registra y valida cada mensaje recibido en la tabla persistente 'processed_messages'
 * mediante constraint de clave primaria (message_id).
 *
 * A diferencia de una caché en memoria, esta solución:
 *  1. Sobrevive a reinicios del microservicio.
 *  2. Garantiza consistencia transaccional multi-hilo (ACID).
 *  3. Almacena la marca de tiempo exacta del primer procesamiento exitoso.
 */
@Service
public class IdempotencyService {

    private static final Logger log = LoggerFactory.getLogger(IdempotencyService.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        try {
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS processed_messages (" +
                "  message_id VARCHAR(100) NOT NULL," +
                "  topic VARCHAR(100) NOT NULL," +
                "  consumer_group VARCHAR(100) NOT NULL," +
                "  processed_at TIMESTAMP NOT NULL," +
                "  PRIMARY KEY (message_id)" +
                ")"
            );
            log.info("✅ [IDEMPOTENCIA] Tabla 'processed_messages' inicializada correctamente.");
        } catch (Exception e) {
            log.error("❌ [IDEMPOTENCIA] Error al inicializar tabla processed_messages: {}", e.getMessage());
        }
    }

    /**
     * Evalúa si un mensaje ya fue procesado anteriormente de forma atómica.
     *
     * @param messageId     Identificador único del evento (UUID)
     * @param topic          Tópico de origen
     * @param consumerGroup  Grupo de consumidor evaluador
     * @return true si el mensaje es DUPLICADO (ya existía), false si es NUEVO y fue registrado.
     */
    public boolean esMensajeDuplicado(String messageId, String topic, String consumerGroup) {
        if (messageId == null || messageId.isBlank()) {
            return false;
        }

        try {
            int inserted = jdbcTemplate.update(
                "INSERT INTO processed_messages (message_id, topic, consumer_group, processed_at) VALUES (?, ?, ?, ?)",
                messageId, topic, consumerGroup, Timestamp.from(Instant.now())
            );
            return inserted == 0;
        } catch (DuplicateKeyException e) {
            log.warn("⚠️ [IDEMPOTENCIA PERSISTENTE] Mensaje descartado: El evento '{}' ya fue procesado previamente en el grupo '{}'.",
                    messageId, consumerGroup);
            return true;
        } catch (Exception e) {
            log.error("❌ [IDEMPOTENCIA] Error al verificar duplicidad en BD: {}", e.getMessage());
            return false;
        }
    }
}

