package com.smart.messaging.controller;

import com.smart.messaging.publisher.EventPublisher;
import com.smart.messaging.rpc.SeatCheckRpcClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 🌐 REST CONTROLLER — Reservas (Flujo Combinado RPC + Pub/Sub)
 *
 * Este controlador implementa el flujo COMPLETO de confirmación de reserva
 * en S.M.A.R.T, combinando ambos tipos de mensajería:
 *
 *   PASO 1 → 🔵 RPC SÍNCRONO:
 *     Verifica disponibilidad del asiento BLOQUEANDO el hilo.
 *     Solo si el servidor responde "DISPONIBLE" → continúa al paso 2.
 *     Si "OCUPADO" → retorna HTTP 400 sin publicar ningún evento.
 *
 *   PASO 2 → 🟢 PUB/SUB ASÍNCRONO:
 *     Publica "reserva.creada" al Topic Exchange.
 *     Los consumidores (email, PDF, auditoría) trabajan en background.
 *     El cliente recibe HTTP 200 inmediatamente.
 *
 * Este patrón combina la CONSISTENCIA del RPC (verificación atómica)
 * con el RENDIMIENTO del Pub/Sub (post-procesos no bloqueantes).
 */
@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ReservationController {

    @Autowired
    private SeatCheckRpcClient rpcClient;

    @Autowired
    private EventPublisher publisher;

    /**
     * Confirma una reserva usando el flujo combinado RPC + Pub/Sub.
     *
     * Body: {
     *   "viajeId":  "V-001",          (o UUID de Supabase)
     *   "asiento":  "4",
     *   "pasajero": "Ana López"
     * }
     *
     * Respuesta exitosa (200):
     *   { "mensaje": "...", "asiento": "4", "patron": "RPC + Pub/Sub" }
     *
     * Respuesta fallida (400):
     *   "❌ Asiento ya ocupado (verificado síncronamente por RPC)"
     *
     * Respuesta de error (500):
     *   "❌ Error interno: ..." (timeout RPC u otro)
     */
    @PostMapping("/confirmar")
    public ResponseEntity<?> confirmarReserva(@RequestBody Map<String, String> body) {
        String viajeId  = body.get("viajeId");
        String asiento  = body.get("asiento");
        String pasajero = body.get("pasajero");

        // Validación de campos requeridos
        if (viajeId == null || asiento == null || pasajero == null) {
            return ResponseEntity.badRequest()
                    .body("❌ Campos requeridos: viajeId, asiento, pasajero");
        }

        try {
            // ── PASO 1: RPC SÍNCRONO ───────────────────────────────────────────
            // El hilo ESPERA aquí hasta recibir respuesta del SeatCheckRpcServer.
            // Esto previene la race condition donde dos usuarios reservan el
            // mismo asiento simultáneamente (RNF-05 de S.M.A.R.T).
            System.out.println("[RESERVATION] 🔄 Iniciando flujo RPC + Pub/Sub...");
            String respuestaRpc = rpcClient.verificarDisponibilidad(viajeId, asiento);

            if (respuestaRpc.startsWith("OCUPADO")) {
                System.out.println("[RESERVATION] ❌ Asiento ocupado — flujo detenido");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("❌ Asiento " + asiento + " ya está ocupado en el viaje " + viajeId +
                              " (verificado síncronamente por RPC)");
            }

            // ── PASO 2: EVENTO ASÍNCRONO ──────────────────────────────────────
            // Asiento confirmado como disponible → publicar evento.
            // Los consumidores (email, PDF, auditoría) procesan en background.
            // El hilo NO espera — retorna inmediatamente al cliente.
            publisher.reservaCreada(Map.of(
                    "viajeId",   viajeId,
                    "asiento",   asiento,
                    "pasajero",  pasajero,
                    "timestamp", System.currentTimeMillis()
            ).toString());

            System.out.println("[RESERVATION] ✅ Reserva confirmada — eventos disparados en background");

            return ResponseEntity.ok(Map.of(
                    "mensaje",  "✅ Reserva confirmada. Email y PDF generándose en background.",
                    "asiento",  asiento,
                    "viajeId",  viajeId,
                    "pasajero", pasajero,
                    "patron",   "🔵 RPC Síncrono (verificación) + 🟢 Pub/Sub Asíncrono (post-procesos)"
            ));

        } catch (RuntimeException e) {
            // Timeout del RPC u otro error inesperado
            System.out.println("[RESERVATION] ⚠ Error en flujo: " + e.getMessage());
            publisher.logError("Error confirmando reserva [viaje=" + viajeId +
                               ", asiento=" + asiento + "]: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error interno: " + e.getMessage());
        }
    }
}
