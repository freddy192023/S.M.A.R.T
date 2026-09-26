package com.smart.messaging.controller;

import com.smart.messaging.publisher.EventPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 🌐 REST CONTROLLER — Eventos Asíncronos
 *
 * Expone endpoints HTTP para que el frontend React publique
 * eventos al módulo de mensajería. Todos los endpoints son
 * ASÍNCRONOS: retornan inmediatamente sin esperar los consumidores.
 *
 * @CrossOrigin permite llamadas desde el frontend en localhost:5173.
 *
 * Endpoints:
 *   POST /api/events/reserva      → publica "reserva.creada"
 *   POST /api/events/cancelacion  → publica "reserva.cancelada"
 *   POST /api/events/viaje        → publica "viaje.programado"
 *   POST /api/events/log          → publica "log.info/warning/error"
 */
@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class EventController {

    @Autowired
    private EventPublisher publisher;

    /**
     * Publica evento de reserva creada.
     * Body: { "viajeId": "...", "asiento": "...", "pasajero": "...", "reservaCode": "..." }
     */
    @PostMapping("/reserva")
    public ResponseEntity<String> publicarReserva(@RequestBody Map<String, Object> reserva) {
        publisher.reservaCreada(reserva.toString());
        return ResponseEntity.ok("✅ Evento 'reserva.creada' publicado (asíncrono) — consumidores procesando en background");
    }

    /**
     * Publica evento de reserva cancelada.
     * Body: { "reservaCode": "...", "viajeId": "...", "asiento": "..." }
     */
    @PostMapping("/cancelacion")
    public ResponseEntity<String> publicarCancelacion(@RequestBody Map<String, Object> reserva) {
        publisher.reservaCancelada(reserva.toString());
        return ResponseEntity.ok("✅ Evento 'reserva.cancelada' publicado (asíncrono)");
    }

    /**
     * Publica evento de viaje programado.
     * Body: { "viajeId": "...", "ruta": "...", "conductorId": "...", "salida": "..." }
     */
    @PostMapping("/viaje")
    public ResponseEntity<String> publicarViaje(@RequestBody Map<String, Object> viaje) {
        publisher.viajeProgramado(viaje.toString());
        return ResponseEntity.ok("✅ Evento 'viaje.programado' publicado (asíncrono)");
    }

    /**
     * Publica un log del sistema.
     * Body: { "nivel": "info|warning|error", "mensaje": "..." }
     */
    @PostMapping("/log")
    public ResponseEntity<String> publicarLog(@RequestBody Map<String, String> body) {
        String nivel   = body.getOrDefault("nivel", "info").toLowerCase().trim();
        String mensaje = body.getOrDefault("mensaje", "");

        switch (nivel) {
            case "error"   -> publisher.logError(mensaje);
            case "warning" -> publisher.logWarning(mensaje);
            default        -> publisher.logInfo(mensaje);
        }

        return ResponseEntity.ok("✅ Log '" + nivel + "' publicado → " + mensaje);
    }
}
