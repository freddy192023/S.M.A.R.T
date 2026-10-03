package com.smart.messaging.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 🟢 CONFIGURACIÓN ASÍNCRONA — Topic Exchange
 *
 * Topología de colas para el proyecto S.M.A.R.T:
 *
 *  s.m.a.r.t_exchange (Topic)
 *    ├── reserva.creada      → reserva_creada_queue    (email + PDF + auditoría)
 *    ├── reserva.cancelada   → reserva_cancelada_queue (liberar asiento)
 *    ├── viaje.programado    → viaje_programado_queue  (notificar conductor)
 *    ├── log.*               → logs_queue              (todos los logs)
 *    └── log.error           → errors_only_queue       (solo errores críticos)
 *
 * El wildcard "log.*" captura log.info, log.warning y log.error.
 * "log.error" también llega a errors_only_queue (doble consumo — guía 2.1.3).
 */
@Configuration
public class RabbitMQConfig {

    // ── Exchange ──────────────────────────────────────────────────────────────
    public static final String EXCHANGE = "s.m.a.r.t_exchange";

    public static final String DLX = "smart_dlx";
    public static final String DEAD_LETTER_Q = "smart_dlq";

    // ── Nombres de colas ──────────────────────────────────────────────────────
    public static final String RESERVA_CREADA_Q   = "reserva_creada_queue";
    public static final String SMART_EMAIL_Q      = "smart.reserva.email";
    public static final String RESERVA_CANCEL_Q   = "reserva_cancelada_queue";
    public static final String VIAJE_PROGRAMADO_Q = "viaje_programado_queue";
    public static final String LOGS_Q             = "logs_queue";
    public static final String ERRORS_Q           = "errors_only_queue";

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
        return new Queue(DEAD_LETTER_Q, true);
    }

    @Bean
    public Binding bindDeadLetter(TopicExchange smartDeadLetterExchange, Queue deadLetterQueue) {
        return BindingBuilder.bind(deadLetterQueue).to(smartDeadLetterExchange).with("dead.letter");
    }

    // ── Declaración de colas (durable = true) ─────────────────────────────────
    // Esta cola tiene configurado el DLX para que los mensajes fallidos vayan a smart_dlq
    @Bean 
    public Queue reservaCreadaQueue() { 
        return QueueBuilder.durable(RESERVA_CREADA_Q)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", "dead.letter")
                .build();
    }
    
    @Bean public Queue smartEmailQueue()      { return new Queue(SMART_EMAIL_Q,      true); }
    @Bean public Queue reservaCancelQueue()   { return new Queue(RESERVA_CANCEL_Q,   true); }
    @Bean public Queue viajeProgramadoQueue() { return new Queue(VIAJE_PROGRAMADO_Q, true); }
    @Bean public Queue logsQueue()            { return new Queue(LOGS_Q,             true); }
    @Bean public Queue errorsQueue()          { return new Queue(ERRORS_Q,           true); }

    // ── Bindings (routing key → cola destino) ─────────────────────────────────
    @Bean
    public Binding bindReservaCreada(TopicExchange ex, Queue reservaCreadaQueue) {
        return BindingBuilder.bind(reservaCreadaQueue).to(ex).with("reserva.creada");
    }

    @Bean
    public Binding bindSmartEmail(TopicExchange ex, Queue smartEmailQueue) {
        return BindingBuilder.bind(smartEmailQueue).to(ex).with("reserva.creada");
    }

    @Bean
    public Binding bindReservaCancel(TopicExchange ex, Queue reservaCancelQueue) {
        return BindingBuilder.bind(reservaCancelQueue).to(ex).with("reserva.cancelada");
    }

    @Bean
    public Binding bindViajeProgramado(TopicExchange ex, Queue viajeProgramadoQueue) {
        return BindingBuilder.bind(viajeProgramadoQueue).to(ex).with("viaje.programado");
    }

    // "log.*" captura log.info, log.warning y log.error
    @Bean
    public Binding bindLogsAll(TopicExchange ex, Queue logsQueue) {
        return BindingBuilder.bind(logsQueue).to(ex).with("log.*");
    }

    // "log.error" también llega a errors_only_queue (el mismo mensaje a 2 colas)
    @Bean
    public Binding bindErrorsOnly(TopicExchange ex, Queue errorsQueue) {
        return BindingBuilder.bind(errorsQueue).to(ex).with("log.error");
    }
}
