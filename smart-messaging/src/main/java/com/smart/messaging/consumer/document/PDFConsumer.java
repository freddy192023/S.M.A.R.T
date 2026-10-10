package com.smart.messaging.consumer.document;

import com.smart.messaging.config.RabbitMQConfig;
import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

/**
 * 📄 CONSUMIDOR DE PDF — Dominio: Documentos
 *
 * Genera comprobante de reserva en formato PDF.
 * En producción: integrar iTextPDF, JasperReports o Flying Saucer.
 *
 * ACK Manual: confirma procesamiento exitoso al broker.
 * NACK sin requeue: mensajes fallidos van al DLX → DLQ.
 */
@Service
public class PDFConsumer {

    @RabbitListener(queues = RabbitMQConfig.RESERVA_CREADA_Q)
    public void generarComprobantePDF(Message message, Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws java.io.IOException {
        String reservaJson = new String(message.getBody());
        try {
            System.out.println("[PDF] 📄 Generando comprobante de reserva...");
            System.out.println("[PDF]    Datos de reserva: " + reservaJson);
            // TODO: pdfService.generate(...)
            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            System.out.println("[PDF] ❌ Error al generar PDF: " + e.getMessage());
            channel.basicNack(deliveryTag, false, false);
        }
    }
}
