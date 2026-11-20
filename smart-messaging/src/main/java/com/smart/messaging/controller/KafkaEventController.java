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
import java.util.UUID;

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
    public ResponseEntity<?> simularMensajeDefectuoso(@RequestBody(required = false) Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) {
            payload = Map.of("causa", "Mensaje de prueba con estructura intencionalmente corrupta para forzar DLT");
        }
        // Enviar payload sin estructura tipada para forzar error de deserialización/procesamiento
        publisher.enviar("smart.viajes", "error-key", payload.toString());
        return ResponseEntity.ok(Map.of(
                "mensaje", "⚠️ Mensaje de prueba no conforme enviado a 'smart.viajes'. El ErrorHandler reintentará y derivará a 'smart.viajes.DLT'",
                "payload", payload
        ));
    }

    /**
     * POST /api/kafka/events/publicar-duplicado — Demostración de Idempotencia en Vivo (Documento 3.3.3)
     *
     * Publica el mismo evento con el mismo eventoId dos veces seguidas en smart.viajes.
     * El consumidor procesa el 1er mensaje y descarta el 2do detectándolo como DUPLICADO
     * gracias a la tabla persistente 'processed_messages' en Supabase Cloud PostgreSQL.
     */
    @PostMapping("/publicar-duplicado")
    public ResponseEntity<?> publicarDuplicado() {
        String fixedEventoId = "DEMO-DUP-" + UUID.randomUUID().toString().substring(0, 8);
        ViajeKafkaEvent evento = new ViajeKafkaEvent();
        evento.setEventoId(fixedEventoId);
        evento.setViajeId("VIAJE-IDEMP-01");
        evento.setBusId("BUS-IDEMP-99");
        evento.setOrigen("Santiago");
        evento.setDestino("Viña del Mar");
        evento.setEstado("PROGRAMADO");

        // 1era Publicación (será procesada y guardada en BD Supabase)
        publisher.publicarViaje(evento);

        // 2da Publicación idéntica con el mismo eventoId (será detectada y descartada por IdempotencyService)
        publisher.publicarViaje(evento);

        return ResponseEntity.ok(Map.of(
                "mensaje", "🔄 Se enviaron 2 copias consecutivas del mismo evento a 'smart.viajes'",
                "eventoId", fixedEventoId,
                "topico", "smart.viajes",
                "resultadoEsperado", "El 1er mensaje se procesa; el 2do es detectado como DUPLICADO en Supabase PostgreSQL y descartado sin reprocesar"
        ));
    }
}

