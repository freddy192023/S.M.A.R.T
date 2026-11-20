package com.smart.messaging.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * 📡 DTO Tipado para Eventos de Telemetría IoT en Kafka (Bloque 4.2)
 *
 * Tópico: smart.telemetria
 * Representa datos de GPS, velocidad y estado de la flota en tiempo real.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class TelemetriaBusEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private String eventoId;

    @NotBlank(message = "El busId es obligatorio")
    private String busId;

    private String viajeId;
    private double latitud;
    private double longitud;
    private double velocidadKmh;
    private double nivelCombustible;
    private String alerta; // "NORMAL", "EXCESO_VELOCIDAD", "DESVIO_RUTA", "EMERGENCIA"
    private long timestamp;

    public TelemetriaBusEvent() {
        this.eventoId = UUID.randomUUID().toString();
        this.timestamp = Instant.now().toEpochMilli();
        this.alerta = "NORMAL";
    }

    public TelemetriaBusEvent(String busId, String viajeId, double latitud, double longitud, double velocidadKmh, double nivelCombustible, String alerta) {
        this.eventoId = UUID.randomUUID().toString();
        this.busId = busId;
        this.viajeId = viajeId;
        this.latitud = latitud;
        this.longitud = longitud;
        this.velocidadKmh = velocidadKmh;
        this.nivelCombustible = nivelCombustible;
        this.alerta = alerta != null ? alerta : "NORMAL";
        this.timestamp = Instant.now().toEpochMilli();
    }

    public String getEventoId() {
        return eventoId;
    }

    public void setEventoId(String eventoId) {
        this.eventoId = eventoId;
    }

    public String getBusId() {
        return busId;
    }

    public void setBusId(String busId) {
        this.busId = busId;
    }

    public String getViajeId() {
        return viajeId;
    }

    public void setViajeId(String viajeId) {
        this.viajeId = viajeId;
    }

    public double getLatitud() {
        return latitud;
    }

    public void setLatitud(double latitud) {
        this.latitud = latitud;
    }

    public double getLongitud() {
        return longitud;
    }

    public void setLongitud(double longitud) {
        this.longitud = longitud;
    }

    public double getVelocidadKmh() {
        return velocidadKmh;
    }

    public void setVelocidadKmh(double velocidadKmh) {
        this.velocidadKmh = velocidadKmh;
    }

    public double getNivelCombustible() {
        return nivelCombustible;
    }

    public void setNivelCombustible(double nivelCombustible) {
        this.nivelCombustible = nivelCombustible;
    }

    public String getAlerta() {
        return alerta;
    }

    public void setAlerta(String alerta) {
        this.alerta = alerta;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "TelemetriaBusEvent{" +
                "eventoId='" + eventoId + '\'' +
                ", busId='" + busId + '\'' +
                ", velocidad=" + velocidadKmh + " km/h" +
                ", alerta='" + alerta + '\'' +
                '}';
    }
}

