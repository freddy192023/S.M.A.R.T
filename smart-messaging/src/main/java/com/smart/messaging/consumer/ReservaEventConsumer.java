package com.smart.messaging.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

/**
 * 🟢 CONSUMIDORES ASÍNCRONOS — ReservaEventConsumer
 *
 * Demuestra el patrón Pub/Sub de RabbitMQ:
 * UN solo mensaje "reserva.creada" activa TRES consumidores en PARALELO.
 *
 * Esto es posible porque se declaran 3 métodos escuchando la misma cola.
 * RabbitMQ distribuye los mensajes entre todos los consumidores activos.
 *
 * Flujo real de reserva en S.M.A.R.T:
 *   1. Frontend llama a POST /api/reservations/confirmar
 *   2. RPC verifica asiento (síncrono — bloquea)
 *   3. Si disponible → publica "reserva.creada" (asíncrono — no bloquea)
 *   4. Este consumer dispara email + PDF + auditoría en paralelo
 *   5. El usuario ya recibió respuesta en el paso 2
 */
@Service
public class ReservaEventConsumer {

    /**
     * Consumidor 1: Envía email de confirmación al pasajero.
     * En producción: integrar SendGrid, Mailgun o JavaMailSender.
     */
    @RabbitListener(queues = {"reserva_creada_queue", "smart.reserva.email"})
    public void enviarEmailConfirmacion(String reservaJson) {
        System.out.println("[EMAIL] ✉  Enviando confirmación al pasajero...");
        System.out.println("[EMAIL]    Datos de reserva: " + reservaJson);
        // TODO: emailService.send(reserva.getPassengerEmail(), "Reserva confirmada", template);
    }

    /**
     * Consumidor 2: Genera el comprobante PDF de la reserva.
     * En producción: integrar iText 7, JasperReports o Apache PDFBox.
     */
    @RabbitListener(queues = "reserva_creada_queue")
    public void generarComprobantePDF(String reservaJson) {
        System.out.println("[PDF] 📄 Generando comprobante de reserva...");
        System.out.println("[PDF]    Datos de reserva: " + reservaJson);
        // TODO: pdfService.generate(reservaCode, passengerName, seatNumber, tripDetails);
    }

    /**
     * Consumidor 3: Registra la reserva en la bitácora de auditoría.
     */
    @RabbitListener(queues = "reserva_creada_queue")
    public void registrarAuditoria(String reservaJson) {
        System.out.println("[AUDITORIA] 📝 Registrando reserva en bitácora...");
        System.out.println("[AUDITORIA]    " + reservaJson);
        // TODO: auditService.log("RESERVA_CREADA", reservaJson, LocalDateTime.now());
    }

    /**
     * Consumidor de cancelación: Libera el asiento cuando se cancela una reserva.
     */
    @RabbitListener(queues = "reserva_cancelada_queue")
    public void liberarAsiento(String reservaJson) {
        System.out.println("[ASIENTO] 🔓 Liberando asiento de reserva cancelada...");
        System.out.println("[ASIENTO]    " + reservaJson);
        // TODO: seatService.markAsAvailable(viajeId, seatNumber);
    }
}
