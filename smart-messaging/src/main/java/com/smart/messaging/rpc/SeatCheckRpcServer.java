package com.smart.messaging.rpc;

import com.smart.messaging.config.RpcConfig;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

/**
 * 🔵 SERVIDOR RPC (SÍNCRONO) — SeatCheckRpcServer
 *
 * Escucha la cola "seat_check_rpc_queue" y responde peticiones de
 * verificación de asientos. El cliente queda BLOQUEADO esperando
 * esta respuesta antes de continuar.
 *
 * Protocolo:
 *   Petición:  "viajeId:asientoNumero"        (ej: "V-001:4")
 *   Respuesta: "DISPONIBLE:viajeId:asiento"   (ej: "DISPONIBLE:V-001:4")
 *              "OCUPADO:viajeId:asiento"       (ej: "OCUPADO:V-001:5")
 *
 * Spring AMQP gestiona automáticamente el replyTo y correlationId
 * gracias a la anotación @RabbitListener con retorno String.
 *
 * IMPORTANTE: En producción, reemplazar la simulación por una
 * consulta real a Supabase via JDBC o API REST.
 */
@Service
public class SeatCheckRpcServer {

    @RabbitListener(queues = RpcConfig.SEAT_CHECK_QUEUE)
    public String verificarAsiento(String peticion) {
        System.out.println("[RPC-SERVER] 🔍 Petición recibida: " + peticion);

        // Formato esperado: "viajeId:asientoNumero"
        String[] partes = peticion.split(":");
        if (partes.length < 2) {
            System.out.println("[RPC-SERVER] ⚠ Formato de petición inválido: " + peticion);
            return "ERROR:formato_invalido";
        }

        String viajeId = partes[0];
        String asiento = partes[1];

        // ── SIMULACIÓN ─────────────────────────────────────────────────────────
        // Asientos PARES → disponibles | Asientos IMPARES → ocupados
        // ── PRODUCCIÓN: reemplazar por consulta a Supabase ────────────────────
        //
        // Ejemplo con Supabase REST API:
        // boolean disponible = supabaseClient.checkSeatAvailability(viajeId, Integer.parseInt(asiento));
        //
        boolean disponible;
        try {
            disponible = Integer.parseInt(asiento) % 2 == 0;
        } catch (NumberFormatException e) {
            System.out.println("[RPC-SERVER] ⚠ Número de asiento inválido: " + asiento);
            return "ERROR:asiento_invalido";
        }

        String respuesta = disponible
                ? "DISPONIBLE:" + viajeId + ":" + asiento
                : "OCUPADO:"    + viajeId + ":" + asiento;

        System.out.println("[RPC-SERVER] 📤 Respondiendo: " + respuesta);
        return respuesta;
    }
}
