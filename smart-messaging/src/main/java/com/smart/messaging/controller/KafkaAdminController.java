package com.smart.messaging.controller;

import com.smart.messaging.dto.KafkaTopicRequest;
import com.smart.messaging.dto.KafkaTopicResponse;
import com.smart.messaging.service.KafkaAdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 🛠️ REST CONTROLLER — Administración de Kafka (Bloque 5.1, 5.2 y 5.3)
 *
 * Expone endpoints REST para administrar la plataforma Kafka:
 *  - POST /api/kafka/topics              -> Crear tópico
 *  - GET /api/kafka/topics               -> Listar tópicos
 *  - GET /api/kafka/topics/{topicName}   -> Describir tópico
 *  - DELETE /api/kafka/topics/{topicName}-> Eliminar tópico
 *  - GET /api/kafka/consumer-groups      -> Listar grupos de consumidores
 *  - GET /api/kafka/consumer-groups/{id} -> Detalle de grupo y miembros
 */
@RestController
@RequestMapping("/api/kafka")
@CrossOrigin(origins = "*")
public class KafkaAdminController {

    @Autowired
    private KafkaAdminService adminService;

    /**
     * POST /api/kafka/topics — Crear un nuevo tópico con particiones, retención y cleanup.policy
     */
    @PostMapping("/topics")
    public ResponseEntity<?> createTopic(@Valid @RequestBody KafkaTopicRequest request) {
        try {
            adminService.createTopic(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "mensaje", "✅ Tópico '" + request.getTopicName() + "' creado exitosamente",
                    "partitions", request.getPartitions(),
                    "replicationFactor", request.getReplicationFactor(),
                    "retentionMs", request.getRetentionMs(),
                    "cleanupPolicy", request.getCleanupPolicy()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "❌ Error al crear tópico: " + e.getMessage()));
        }
    }

    /**
     * GET /api/kafka/topics — Listar todos los tópicos
     */
    @GetMapping("/topics")
    public ResponseEntity<?> listTopics() {
        try {
            List<KafkaTopicResponse> topics = adminService.listTopics();
            return ResponseEntity.ok(topics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "❌ Error al listar tópicos: " + e.getMessage()));
        }
    }

    /**
     * GET /api/kafka/topics/{topicName} — Obtener detalle de configuración de un tópico
     */
    @GetMapping("/topics/{topicName}")
    public ResponseEntity<?> describeTopic(@PathVariable String topicName) {
        try {
            KafkaTopicResponse topic = adminService.describeTopic(topicName);
            return ResponseEntity.ok(topic);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "❌ No se encontró o falló la consulta del tópico '" + topicName + "': " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/kafka/topics/{topicName} — Eliminar un tópico
     */
    @DeleteMapping("/topics/{topicName}")
    public ResponseEntity<?> deleteTopic(@PathVariable String topicName) {
        try {
            adminService.deleteTopic(topicName);
            return ResponseEntity.ok(Map.of("mensaje", "🗑️ Tópico '" + topicName + "' eliminado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "❌ Error al eliminar el tópico: " + e.getMessage()));
        }
    }

    /**
     * GET /api/kafka/consumer-groups — Listar todos los Consumer Groups
     */
    @GetMapping("/consumer-groups")
    public ResponseEntity<?> listConsumerGroups() {
        try {
            List<Map<String, Object>> groups = adminService.listConsumerGroups();
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "❌ Error al listar consumer groups: " + e.getMessage()));
        }
    }

    /**
     * GET /api/kafka/consumer-groups/{groupId} — Detalle de miembros y particiones de un grupo
     */
    @GetMapping("/consumer-groups/{groupId}")
    public ResponseEntity<?> describeConsumerGroup(@PathVariable String groupId) {
        try {
            Map<String, Object> group = adminService.describeConsumerGroup(groupId);
            return ResponseEntity.ok(group);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "❌ No se pudo describir el grupo '" + groupId + "': " + e.getMessage()));
        }
    }
}

