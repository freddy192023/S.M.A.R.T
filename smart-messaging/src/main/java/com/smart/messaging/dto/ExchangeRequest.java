package com.smart.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * DTO de solicitud para creación de exchanges RabbitMQ con validación (Indicador 8)
 */
public class ExchangeRequest {

    @NotBlank(message = "El nombre del exchange no puede estar vacío")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "El nombre solo puede contener letras, números, puntos, guiones y guiones bajos")
    private String exchangeName;

    @NotBlank(message = "El tipo de exchange no puede estar vacío (direct, topic, fanout, headers)")
    @Pattern(regexp = "^(direct|topic|fanout|headers)$", message = "El tipo debe ser: direct, topic, fanout o headers")
    private String type = "topic";

    private boolean durable = true;

    public ExchangeRequest() {}

    public ExchangeRequest(String exchangeName, String type, boolean durable) {
        this.exchangeName = exchangeName;
        this.type = type;
        this.durable = durable;
    }

    public String getExchangeName() {
        return exchangeName;
    }

    public void setExchangeName(String exchangeName) {
        this.exchangeName = exchangeName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isDurable() {
        return durable;
    }

    public void setDurable(boolean durable) {
        this.durable = durable;
    }
}
