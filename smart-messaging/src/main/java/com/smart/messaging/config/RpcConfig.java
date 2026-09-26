package com.smart.messaging.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 🔵 CONFIGURACIÓN SÍNCRONA — Cola RPC
 *
 * El patrón RPC sobre RabbitMQ funciona así:
 *
 *  Cliente (SeatCheckRpcClient)
 *    1. Crea una cola temporal de respuesta (replyTo)
 *    2. Envía petición a seat_check_rpc_queue con correlationId + replyTo
 *    3. BLOQUEA esperando respuesta en la cola temporal
 *
 *  Servidor (SeatCheckRpcServer)
 *    4. Recibe petición
 *    5. Procesa y devuelve respuesta a la cola replyTo
 *
 *  Cliente retoma
 *    6. Recibe respuesta → continúa ejecución
 *
 * Spring AMQP gestiona la cola temporal y el correlationId automáticamente
 * con rabbitTemplate.convertSendAndReceive().
 */
@Configuration
public class RpcConfig {

    public static final String SEAT_CHECK_QUEUE = "seat_check_rpc_queue";

    // Cola no durable (se puede perder si RabbitMQ reinicia — OK para RPC temporal)
    @Bean
    public Queue seatCheckQueue() {
        return new Queue(SEAT_CHECK_QUEUE, false);
    }
}
