package com.smart.messaging.dto;

import java.util.Map;

/**
 * 📊 DTO de respuesta con detalles de un tópico Kafka
 */
public class KafkaTopicResponse {

    private String topicName;
    private int partitions;
    private int replicationFactor;
    private boolean isInternal;
    private Map<String, String> configurations;

    public KafkaTopicResponse() {}

    public KafkaTopicResponse(String topicName, int partitions, int replicationFactor, boolean isInternal, Map<String, String> configurations) {
        this.topicName = topicName;
        this.partitions = partitions;
        this.replicationFactor = replicationFactor;
        this.isInternal = isInternal;
        this.configurations = configurations;
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

    public int getReplicationFactor() {
        return replicationFactor;
    }

    public void setReplicationFactor(int replicationFactor) {
        this.replicationFactor = replicationFactor;
    }

    public boolean isInternal() {
        return isInternal;
    }

    public void setInternal(boolean internal) {
        isInternal = internal;
    }

    public Map<String, String> getConfigurations() {
        return configurations;
    }

    public void setConfigurations(Map<String, String> configurations) {
        this.configurations = configurations;
    }
}

