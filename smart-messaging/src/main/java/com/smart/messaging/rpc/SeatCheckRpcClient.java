package com.smart.messaging.rpc;

import com.smart.messaging.config.RpcConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 🔵 CLIENTE RPC (SÍNCRONO) — SeatCheckRpcClient
 *
 * Envía una petición de verificación de asiento y BLOQUEA el hilo
 * hasta recibir la respuesta del servidor o que expire el timeout.
 *
 * Diferencia clave con el asíncrono:
 *   - convertAndSend()          → no espera, retorna null inmediatamente
 *   - convertSendAndReceive()   → ESPERA la respuesta (este cliente)
 *
 * Uso en ReservationController:
 *   String resultado = rpcClient.verificarDisponibilidad("V-001", "4");
 *   if (resultado.startsWith("DISPONIBLE")) { ... }
 */
@Service
public class SeatCheckRpcClient {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    /**
     * Verifica si un asiento está disponible para un viaje.
     *
     * @param viajeId        ID del viaje (ej: "V-001" o UUID de Supabase)
     * @param asientoNumero  Número del asiento (ej: "4")
     * @return "DISPONIBLE:viajeId:asiento" o "OCUPADO:viajeId:asiento"
     * @throws RuntimeException si no hay respuesta dentro del timeout configurado
     */
    public String verificarDisponibilidad(String viajeId, String asientoNumero) {
        String peticion = viajeId + ":" + asientoNumero;
        System.out.println("[RPC-CLIENT] 📨 Enviando petición: " + peticion);
        System.out.println("[RPC-CLIENT] ⏳ Esperando respuesta del servidor RPC...");

        // convertSendAndReceive BLOQUEA hasta:
        //   a) Recibir respuesta del SeatCheckRpcServer
        //   b) Expirar el timeout (por defecto 5s en Spring AMQP)
        Object respuesta = rabbitTemplate.convertSendAndReceive(
                "",                         // exchange vacío = exchange por defecto (direct)
                RpcConfig.SEAT_CHECK_QUEUE, // routing key = nombre de la cola
                peticion
        );

        if (respuesta == null) {
            System.out.println("[RPC-CLIENT] ❌ Timeout — sin respuesta del servidor RPC");
            throw new RuntimeException("Timeout: el servidor RPC no respondió a tiempo. " +
                    "Verifica que el módulo smart-messaging esté activo.");
        }

        String resultado = respuesta.toString();
        System.out.println("[RPC-CLIENT] ✅ Respuesta recibida: " + resultado);
        return resultado;
    }
}
