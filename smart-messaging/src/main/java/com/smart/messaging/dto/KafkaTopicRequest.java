package com.smart.messaging.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.HashMap;
import java.util.Map;

/**
 * 🛠️ DTO para creación y modificación de Tópicos en Kafka (Bloque 5.1 y 5.2)
 */
public class KafkaTopicRequest {

    @NotBlank(message = "El nombre del tópico es obligatorio")
    private String topicName;

    @Min(value = 1, message = "Debe tener al menos 1 partición")
    private int partitions = 1;

    @Min(value = 1, message = "El factor de replicación debe ser al menos 1")
    private short replicationFactor = 1;

    // Parámetros avanzados (Bloque 5.2)
    private Long retentionMs = 604800000L; // 7 días por defecto
    private String cleanupPolicy = "delete"; // "delete" o "compact"

    public KafkaTopicRequest() {}

    public KafkaTopicRequest(String topicName, int partitions, short replicationFactor) {
        this.topicName = topicName;
        this.partitions = partitions;
        this.replicationFactor = replicationFactor;
    }

    public String getTopicName() {
        return topicName;
    }

    public void setTopicName(String topicName) {
        this.topicName = topicName;
    }

    public int getPartitions() {
        return partitions;
    }

    public void setPartitions(int partitions) {
        this.partitions = partitions;
    }

    public short getReplicationFactor() {
        return replicationFactor;
    }

    public void setReplicationFactor(short replicationFactor) {
        this.replicationFactor = replicationFactor;
    }

    public Long getRetentionMs() {
        return retentionMs;
    }

    public void setRetentionMs(Long retentionMs) {
        this.retentionMs = retentionMs;
    }

    public String getCleanupPolicy() {
        return cleanupPolicy;
    }

    public void setCleanupPolicy(String cleanupPolicy) {
        this.cleanupPolicy = cleanupPolicy;
    }

    public Map<String, String> toTopicConfigs() {
        Map<String, String> configs = new HashMap<>();
        if (retentionMs != null) {
            configs.put("retention.ms", String.valueOf(retentionMs));
        }
        if (cleanupPolicy != null) {
            configs.put("cleanup.policy", cleanupPolicy);
        }
        return configs;
    }
}

