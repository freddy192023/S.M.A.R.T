package com.smart.messaging.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * 🎟️ DTO Tipado para Eventos de Reservas en Kafka (Bloque 4.2)
 *
 * Tópico: smart.reservas
 * Representa la creación, confirmación o anulación de reservas de asientos.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReservaKafkaEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String eventoId;

    @NotBlank(message = "El reservaId es obligatorio")
    private String reservaId;

    @NotBlank(message = "El viajeId es obligatorio")
    private String viajeId;

    @Min(value = 1, message = "El número de asiento debe ser mayor a 0")
    private int asientoNumero;

    private String pasajeroNombre;
    private String pasajeroEmail;
    private String tipoEvento; // "CREADA", "CONFIRMADA", "CANCELADA"
    private double monto;
    private long timestamp;

    public ReservaKafkaEvent() {
        this.eventoId = UUID.randomUUID().toString();
        this.timestamp = Instant.now().toEpochMilli();
    }

    public ReservaKafkaEvent(String reservaId, String viajeId, int asientoNumero, String pasajeroNombre, String pasajeroEmail, String tipoEvento, double monto) {
        this.eventoId = UUID.randomUUID().toString();
        this.reservaId = reservaId;
        this.viajeId = viajeId;
        this.asientoNumero = asientoNumero;
        this.pasajeroNombre = pasajeroNombre;
        this.pasajeroEmail = pasajeroEmail;
        this.tipoEvento = tipoEvento != null ? tipoEvento : "CREADA";
        this.monto = monto;
        this.timestamp = Instant.now().toEpochMilli();
    }

    public String getEventoId() {
        return eventoId;
    }

    public void setEventoId(String eventoId) {
        this.eventoId = eventoId;
    }

    public String getReservaId() {
        return reservaId;
    }

    public void setReservaId(String reservaId) {
        this.reservaId = reservaId;
    }

    public String getViajeId() {
        return viajeId;
    }

    public void setViajeId(String viajeId) {
        this.viajeId = viajeId;
    }

    public int getAsientoNumero() {
        return asientoNumero;
    }

    public void setAsientoNumero(int asientoNumero) {
        this.asientoNumero = asientoNumero;
    }

    public String getPasajeroNombre() {
        return pasajeroNombre;
    }

    public void setPasajeroNombre(String pasajeroNombre) {
        this.pasajeroNombre = pasajeroNombre;
    }

    public String getPasajeroEmail() {
        return pasajeroEmail;
    }

    public void setPasajeroEmail(String pasajeroEmail) {
        this.pasajeroEmail = pasajeroEmail;
    }

    public String getTipoEvento() {
        return tipoEvento;
    }

    public void setTipoEvento(String tipoEvento) {
        this.tipoEvento = tipoEvento;
    }

    public double getMonto() {
        return monto;
    }

    public void setMonto(double monto) {
        this.monto = monto;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "ReservaKafkaEvent{" +
                "eventoId='" + eventoId + '\'' +
                ", reservaId='" + reservaId + '\'' +
                ", viajeId='" + viajeId + '\'' +
                ", asiento=" + asientoNumero +
                ", tipo='" + tipoEvento + '\'' +
                '}';
    }
}

