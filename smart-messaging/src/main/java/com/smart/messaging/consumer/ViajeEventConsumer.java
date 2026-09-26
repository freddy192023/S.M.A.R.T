package com.smart.messaging.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

/**
 * 🟢 CONSUMIDOR DE VIAJES — ViajeEventConsumer
 *
 * Se activa cuando el administrador programa un nuevo viaje.
 * Notifica al conductor asignado sobre su próximo viaje.
 *
 * Routing key: "viaje.programado" → viaje_programado_queue
 *
 * En producción: integrar notificaciones push, email al conductor,
 * o integración con el dashboard del conductor en S.M.A.R.T.
 */
@Service
public class ViajeEventConsumer {

    @RabbitListener(queues = "viaje_programado_queue")
    public void notificarConductor(String viajeJson) {
        System.out.println("[CONDUCTOR] 🚍 Nuevo viaje programado:");
        System.out.println("[CONDUCTOR]    " + viajeJson);
        // TODO: pushNotificationService.send(driver.getDeviceToken(), "Nuevo viaje asignado");
        // TODO: emailService.send(driver.getEmail(), "Tienes un nuevo viaje", viajeDetails);
    }
}
