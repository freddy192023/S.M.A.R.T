package com.smart.messaging.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * 🚌 DTO Tipado para Eventos de Viajes en Kafka (Bloque 4.2)
 *
 * Tópico: smart.viajes
 * Representa la creación, actualización o despacho de un viaje en S.M.A.R.T.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ViajeKafkaEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String eventoId;

    @NotBlank(message = "El viajeId es obligatorio")
    private String viajeId;

    @NotBlank(message = "El busId es obligatorio")
    private String busId;

    private String conductorId;
    private String origen;
    private String destino;
    private String fechaSalida;
    private String estado; // "PROGRAMADO", "EN_CURSO", "FINALIZADO", "CANCELADO"
    private long timestamp;

    public ViajeKafkaEvent() {
        this.eventoId = UUID.randomUUID().toString();
        this.timestamp = Instant.now().toEpochMilli();
    }

    public ViajeKafkaEvent(String viajeId, String busId, String conductorId, String origen, String destino, String fechaSalida, String estado) {
        this.eventoId = UUID.randomUUID().toString();
        this.viajeId = viajeId;
        this.busId = busId;
        this.conductorId = conductorId;
        this.origen = origen;
        this.destino = destino;
        this.fechaSalida = fechaSalida;
        this.estado = estado != null ? estado : "PROGRAMADO";
        this.timestamp = Instant.now().toEpochMilli();
    }

    public String getEventoId() {
        return eventoId;
    }

    public void setEventoId(String eventoId) {
        this.eventoId = eventoId;
    }

    public String getViajeId() {
        return viajeId;
    }

    public void setViajeId(String viajeId) {
        this.viajeId = viajeId;
    }

    public String getBusId() {
        return busId;
    }

    public void setBusId(String busId) {
        this.busId = busId;
    }

    public String getConductorId() {
        return conductorId;
    }

    public void setConductorId(String conductorId) {
        this.conductorId = conductorId;
    }

    public String getOrigen() {
        return origen;
    }

    public void setOrigen(String origen) {
        this.origen = origen;
    }

    public String getDestino() {
        return destino;
    }

    public void setDestino(String destino) {
        this.destino = destino;
    }

    public String getFechaSalida() {
        return fechaSalida;
    }

    public void setFechaSalida(String fechaSalida) {
        this.fechaSalida = fechaSalida;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "ViajeKafkaEvent{" +
                "eventoId='" + eventoId + '\'' +
                ", viajeId='" + viajeId + '\'' +
                ", busId='" + busId + '\'' +
                ", estado='" + estado + '\'' +
                ", origen='" + origen + '\'' +
                ", destino='" + destino + '\'' +
                '}';
    }
}

