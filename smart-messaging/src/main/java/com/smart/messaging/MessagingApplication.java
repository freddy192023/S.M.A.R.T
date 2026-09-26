package com.smart.messaging;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * S.M.A.R.T — Módulo de Mensajería
 * Implementa mensajería asíncrona (Pub/Sub) y síncrona (RPC) sobre RabbitMQ.
 *
 * 🟢 Asíncrono: EventPublisher → Topic Exchange → Consumidores (email, PDF, logs, auditoría)
 * 🔵 Síncrono:  SeatCheckRpcClient → seat_check_rpc_queue → SeatCheckRpcServer → respuesta
 */
@SpringBootApplication
public class MessagingApplication {

    public static void main(String[] args) {
        SpringApplication.run(MessagingApplication.class, args);
        System.out.println("""
                
                ╔══════════════════════════════════════════════════════╗
                ║   S.M.A.R.T — Módulo de Mensajería v1.0.0           ║
                ║                                                      ║
                ║   🟢 Asíncrono  → Topic Exchange activo              ║
                ║   🔵 Síncrono   → Cola RPC activa                   ║
                ║                                                      ║
                ║   API REST   → http://localhost:8080                 ║
                ║   RabbitMQ   → http://localhost:15672 (guest/guest)  ║
                ╚══════════════════════════════════════════════════════╝
                """);
    }
}
