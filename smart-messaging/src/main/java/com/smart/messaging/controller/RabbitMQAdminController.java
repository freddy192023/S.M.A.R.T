package com.smart.messaging.controller;

import com.smart.messaging.dto.BindingRequest;
import com.smart.messaging.dto.ExchangeRequest;
import com.smart.messaging.dto.QueueRequest;
import com.smart.messaging.service.RabbitResourceManager;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Properties;

/**
 * 🛠️ REST CONTROLLER ADMINISTRADOR (Indicador 6 & Indicador 8)
 *
 * Expone endpoints REST para administrar la topología de mensajería (colas, exchanges, bindings).
 * Aplica validación automática `@Valid` sobre los DTOs de entrada.
 */
@RestController
@RequestMapping("/api/rabbitmq")
@CrossOrigin(origins = "*")
public class RabbitMQAdminController {

    @Autowired
    private RabbitResourceManager resourceManager;

    /**
     * POST /api/rabbitmq/queues — Crear una nueva cola
     */
    @PostMapping("/queues")
    public ResponseEntity<?> createQueue(@Valid @RequestBody QueueRequest request) {
        resourceManager.createQueue(request.getQueueName(), request.isDurable(), request.isAutoDelete());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensaje", "✅ Cola '" + request.getQueueName() + "' creada exitosamente",
                "queueName", request.getQueueName(),
                "durable", request.isDurable()
        ));
    }

    /**
     * POST /api/rabbitmq/exchanges — Crear un nuevo exchange
     */
    @PostMapping("/exchanges")
    public ResponseEntity<?> createExchange(@Valid @RequestBody ExchangeRequest request) {
        resourceManager.createExchange(request.getExchangeName(), request.getType(), request.isDurable());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensaje", "✅ Exchange '" + request.getExchangeName() + "' (" + request.getType() + ") creado exitosamente",
                "exchangeName", request.getExchangeName(),
                "type", request.getType()
        ));
    }

    /**
     * POST /api/rabbitmq/bindings — Crear un nuevo binding
     */
    @PostMapping("/bindings")
    public ResponseEntity<?> createBinding(@Valid @RequestBody BindingRequest request) {
        resourceManager.createBinding(request.getQueueName(), request.getExchangeName(), request.getRoutingKey());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensaje", "✅ Binding creado exitosamente entre " + request.getQueueName() + " y " + request.getExchangeName(),
                "routingKey", request.getRoutingKey()
        ));
    }

    /**
     * GET /api/rabbitmq/queues/{queueName} — Consultar estado de una cola
     */
    @GetMapping("/queues/{queueName}")
    public ResponseEntity<?> getQueueInfo(@PathVariable String queueName) {
        Properties info = resourceManager.getQueueInfo(queueName);
        return ResponseEntity.ok(info);
    }

    /**
     * DELETE /api/rabbitmq/queues/{queueName} — Eliminar una cola
     */
    @DeleteMapping("/queues/{queueName}")
    public ResponseEntity<?> deleteQueue(@PathVariable String queueName) {
        boolean deleted = resourceManager.deleteQueue(queueName);
        if (deleted) {
            return ResponseEntity.ok(Map.of("mensaje", "🗑️ Cola '" + queueName + "' eliminada exitosamente"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "❌ No se pudo eliminar la cola '" + queueName + "' (no existe o falló)"));
        }
    }

    /**
     * POST /api/rabbitmq/queues/{queueName}/purge — Purgar mensajes de una cola
     */
    @PostMapping("/queues/{queueName}/purge")
    public ResponseEntity<?> purgeQueue(@PathVariable String queueName) {
        resourceManager.purgeQueue(queueName);
        return ResponseEntity.ok(Map.of("mensaje", "🧹 Cola '" + queueName + "' purgada exitosamente"));
    }
}
