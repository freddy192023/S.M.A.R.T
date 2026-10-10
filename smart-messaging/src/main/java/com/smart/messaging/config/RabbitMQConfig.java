package com.smart.messaging.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 🟢 CONFIGURACIÓN ASÍNCRONA — Topic Exchange
 *
 * Topología de colas para el proyecto S.M.A.R.T:
 *
 *  s.m.a.r.t_exchange (Topic)
 *    ├── reserva.creada      → reserva_creada_queue    (email + PDF + auditoría)
 *    ├── reserva.creada      → smart.reserva.email     (email dedicado)
 *    ├── reserva.cancelada   → reserva_cancelada_queue (liberar asiento)
 *    ├── viaje.programado    → viaje_programado_queue  (notificar conductor)
 *    ├── log.*               → logs_queue              (todos los logs)
 *    └── log.error           → errors_only_queue       (solo errores críticos)
 *
 * Todas las colas tienen configurado:
 *   - x-dead-letter-exchange → smart_dlx (mensajes fallidos van al DLX)
 *   - x-dead-letter-routing-key → dead.letter
 *   - x-message-ttl → 30000ms (30 segundos) para evitar acumulación
 *
 * El wildcard "log.*" captura log.info, log.warning y log.error.
 * "log.error" también llega a errors_only_queue (doble consumo — guía 2.1.3).
 */
@Configuration
public class RabbitMQConfig {

    // ── Exchange ──────────────────────────────────────────────────────────────
    public static final String EXCHANGE = "s.m.a.r.t_exchange";

    // ── Dead Letter Exchange & Queue ─────────────────────────────────────────
    public static final String DLX = "smart_dlx";
    public static final String DEAD_LETTER_Q = "smart_dlq";

    // ── Nombres de colas ──────────────────────────────────────────────────────
    public static final String RESERVA_CREADA_Q   = "reserva_creada_queue";
    public static final String SMART_EMAIL_Q      = "smart.reserva.email";
    public static final String RESERVA_CANCEL_Q   = "reserva_cancelada_queue";
    public static final String VIAJE_PROGRAMADO_Q = "viaje_programado_queue";
    public static final String LOGS_Q             = "logs_queue";
    public static final String ERRORS_Q           = "errors_only_queue";

    // ── TTL (Time-To-Live) para mensajes ─────────────────────────────────────
    private static final int MESSAGE_TTL = 30000;       // 30 segundos en colas normales
    private static final int DLQ_MESSAGE_TTL = 86400000; // 24 horas en la DLQ

    // ── RabbitAdmin — permite crear/eliminar colas y exchanges dinámicamente ─
    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }

    // ── Topic Exchange (durable = true: sobrevive reinicios de RabbitMQ) ─────
    @Bean
    public TopicExchange smartExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    // ── Dead Letter Exchange (DLX) y Dead Letter Queue (DLQ) ──────────────────
    @Bean
    public TopicExchange smartDeadLetterExchange() {
        return new TopicExchange(DLX, true, false);
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DEAD_LETTER_Q)
                .withArgument("x-message-ttl", DLQ_MESSAGE_TTL) // 24h: mensajes muertos expiran
                .build();
    }

    @Bean
    public Binding bindDeadLetter(TopicExchange smartDeadLetterExchange, Queue deadLetterQueue) {
        return BindingBuilder.bind(deadLetterQueue).to(smartDeadLetterExchange).with("dead.letter");
    }

    // ── Declaración de colas (todas con DLX + TTL) ───────────────────────────

    @Bean
    public Queue reservaCreadaQueue() {
        return QueueBuilder.durable(RESERVA_CREADA_Q)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", "dead.letter")
                .withArgument("x-message-ttl", MESSAGE_TTL)
                .build();
    }

    @Bean
    public Queue smartEmailQueue() {
        return QueueBuilder.durable(SMART_EMAIL_Q)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", "dead.letter")
                .withArgument("x-message-ttl", MESSAGE_TTL)
                .build();
    }

    @Bean
    public Queue reservaCancelQueue() {
        return QueueBuilder.durable(RESERVA_CANCEL_Q)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", "dead.letter")
                .withArgument("x-message-ttl", MESSAGE_TTL)
                .build();
    }

    @Bean
    public Queue viajeProgramadoQueue() {
        return QueueBuilder.durable(VIAJE_PROGRAMADO_Q)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", "dead.letter")
                .withArgument("x-message-ttl", MESSAGE_TTL)
                .build();
    }

    @Bean
    public Queue logsQueue() {
        return QueueBuilder.durable(LOGS_Q)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", "dead.letter")
                .withArgument("x-message-ttl", MESSAGE_TTL)
                .build();
    }

    @Bean
    public Queue errorsQueue() {
        return QueueBuilder.durable(ERRORS_Q)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", "dead.letter")
                .withArgument("x-message-ttl", MESSAGE_TTL)
                .build();
    }

    // ── Bindings (routing key → cola destino) ─────────────────────────────────

    @Bean
    public Binding bindReservaCreada(TopicExchange smartExchange, Queue reservaCreadaQueue) {
        return BindingBuilder.bind(reservaCreadaQueue).to(smartExchange).with("reserva.creada");
    }

    @Bean
    public Binding bindSmartEmail(TopicExchange smartExchange, Queue smartEmailQueue) {
        return BindingBuilder.bind(smartEmailQueue).to(smartExchange).with("reserva.creada");
    }

    @Bean
    public Binding bindReservaCancel(TopicExchange smartExchange, Queue reservaCancelQueue) {
        return BindingBuilder.bind(reservaCancelQueue).to(smartExchange).with("reserva.cancelada");
    }

    @Bean
    public Binding bindViajeProgramado(TopicExchange smartExchange, Queue viajeProgramadoQueue) {
        return BindingBuilder.bind(viajeProgramadoQueue).to(smartExchange).with("viaje.programado");
    }

    // "log.*" captura log.info, log.warning y log.error
    @Bean
    public Binding bindLogsAll(TopicExchange smartExchange, Queue logsQueue) {
        return BindingBuilder.bind(logsQueue).to(smartExchange).with("log.*");
    }

    // "log.error" también llega a errors_only_queue (el mismo mensaje a 2 colas)
    @Bean
    public Binding bindErrorsOnly(TopicExchange smartExchange, Queue errorsQueue) {
        return BindingBuilder.bind(errorsQueue).to(smartExchange).with("log.error");
    }
}
