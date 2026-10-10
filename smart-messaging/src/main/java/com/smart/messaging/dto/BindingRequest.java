package com.smart.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * DTO de solicitud para binding entre cola y exchange con validación (Indicador 8)
 */
public class BindingRequest {

    @NotBlank(message = "El nombre de la cola no puede estar vacío")
    private String queueName;

    @NotBlank(message = "El nombre del exchange no puede estar vacío")
    private String exchangeName;

    @NotBlank(message = "La routing key no puede estar vacía")
    @Pattern(regexp = "^[a-zA-Z0-9._*#-]+$", message = "Routing key inválida")
    private String routingKey;

    public BindingRequest() {}

    public BindingRequest(String queueName, String exchangeName, String routingKey) {
        this.queueName = queueName;
        this.exchangeName = exchangeName;
        this.routingKey = routingKey;
    }

    public String getQueueName() {
        return queueName;
    }

    public void setQueueName(String queueName) {
        this.queueName = queueName;
    }

    public String getExchangeName() {
        return exchangeName;
    }

    public void setExchangeName(String exchangeName) {
        this.exchangeName = exchangeName;
    }

    public String getRoutingKey() {
        return routingKey;
    }

    public void setRoutingKey(String routingKey) {
        this.routingKey = routingKey;
    }
}
