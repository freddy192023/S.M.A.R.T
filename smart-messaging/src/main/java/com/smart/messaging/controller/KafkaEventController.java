package com.smart.messaging.controller;

import com.smart.messaging.dto.ReservaKafkaEvent;
import com.smart.messaging.dto.TelemetriaBusEvent;
import com.smart.messaging.dto.ViajeKafkaEvent;
import com.smart.messaging.publisher.KafkaEventPublisher;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 🌐 REST CONTROLLER — Eventos Kafka (Bloque 4.3 y 4.5)
 *
 * Expone endpoints HTTP para publicar eventos asíncronos en Kafka
 * y probar el flujo de producción, consumo y desvío a DLT.
 */
@RestController
@RequestMapping("/api/kafka/events")
@CrossOrigin(origins = "*")
public class KafkaEventController {

    @Autowired
    private KafkaEventPublisher publisher;

    /**
     * POST /api/kafka/events/viaje — Publicar evento de viaje
     */
    @PostMapping("/viaje")
    public ResponseEntity<?> publicarViaje(@Valid @RequestBody ViajeKafkaEvent evento) {
        publisher.publicarViaje(evento);
        return ResponseEntity.ok(Map.of(
                "mensaje", "✅ Evento de viaje enviado a Kafka asíncronamente",
                "viajeId", evento.getViajeId(),
                "topico", "smart.viajes",
                "eventoId", evento.getEventoId()
        ));
    }

    /**
     * POST /api/kafka/events/reserva — Publicar evento de reserva
     */
    @PostMapping("/reserva")
    public ResponseEntity<?> publicarReserva(@Valid @RequestBody ReservaKafkaEvent evento) {
        publisher.publicarReserva(evento);
        return ResponseEntity.ok(Map.of(
                "mensaje", "✅ Evento de reserva enviado a Kafka asíncronamente",
                "reservaId", evento.getReservaId(),
                "topico", "smart.reservas",
                "eventoId", evento.getEventoId()
        ));
    }

    /**
     * POST /api/kafka/events/telemetria — Publicar telemetría IoT de un bus
     */
    @PostMapping("/telemetria")
    public ResponseEntity<?> publicarTelemetria(@Valid @RequestBody TelemetriaBusEvent evento) {
        publisher.publicarTelemetria(evento);
        return ResponseEntity.ok(Map.of(
                "mensaje", "📡 Telemetría enviada al stream de Kafka",
                "busId", evento.getBusId(),
                "velocidadKmh", evento.getVelocidadKmh(),
                "topico", "smart.telemetria"
        ));
    }

    /**
     * POST /api/kafka/events/simular-error — Simular mensaje defectuoso para probar DLT (Bloque 4.5)
     */
    @PostMapping("/simular-error")
    public ResponseEntity<?> simularMensajeDefectuoso(@RequestBody Map<String, Object> payload) {
        // Enviar payload sin estructura tipada para forzar error de deserialización/procesamiento
        publisher.enviar("smart.viajes", "error-key", payload.toString());
        return ResponseEntity.ok(Map.of(
                "mensaje", "⚠️ Mensaje de prueba no conforme enviado a 'smart.viajes'. El ErrorHandler reintentará y derivará a 'smart.viajes.DLT'",
                "payload", payload
        ));
    }
}

