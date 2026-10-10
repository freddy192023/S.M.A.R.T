package com.smart.messaging.service;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Properties;

/**
 * 🛠️ SERVICIO DEDICADO DE ADMINISTRACIÓN DE RECURSOS (Indicador 7)
 *
 * Encapsula la lógica de infraestructura para crear, eliminar y consultar
 * colas, exchanges y bindings de RabbitMQ en tiempo de ejecución.
 *
 * Los controladores REST llaman a los métodos de alto nivel de esta clase.
 */
@Service
public class RabbitResourceManager {

    @Autowired
    private RabbitAdmin rabbitAdmin;

    /**
     * Declara una nueva cola en RabbitMQ.
     */
    public void createQueue(String queueName, boolean durable, boolean autoDelete) {
        Queue queue = new Queue(queueName, durable, false, autoDelete);
        rabbitAdmin.declareQueue(queue);
        System.out.println("[ADMIN-SERVICE] ✅ Cola creada: " + queueName);
    }

    /**
     * Declara un nuevo exchange en RabbitMQ según su tipo.
     */
    public void createExchange(String exchangeName, String type, boolean durable) {
        Exchange exchange;
        switch (type.toLowerCase()) {
            case "direct" -> exchange = new DirectExchange(exchangeName, durable, false);
            case "fanout" -> exchange = new FanoutExchange(exchangeName, durable, false);
            case "headers" -> exchange = new HeadersExchange(exchangeName, durable, false);
            default -> exchange = new TopicExchange(exchangeName, durable, false);
        }
        rabbitAdmin.declareExchange(exchange);
        System.out.println("[ADMIN-SERVICE] ✅ Exchange creado: " + exchangeName + " (" + type + ")");
    }

    /**
     * Declara un binding entre una cola y un exchange con una routing key.
     */
    public void createBinding(String queueName, String exchangeName, String routingKey) {
        Binding binding = new Binding(
                queueName,
                Binding.DestinationType.QUEUE,
                exchangeName,
                routingKey,
                null
        );
        rabbitAdmin.declareBinding(binding);
        System.out.println("[ADMIN-SERVICE] ✅ Binding creado: " + queueName + " <-> " + exchangeName + " (" + routingKey + ")");
    }

    /**
     * Obtiene información detallada de una cola (conteo de mensajes, consumidores).
     */
    public Properties getQueueInfo(String queueName) {
        QueueInformation info = rabbitAdmin.getQueueInfo(queueName);
        Properties props = new Properties();
        if (info != null) {
            props.put("queueName", info.getName());
            props.put("messageCount", info.getMessageCount());
            props.put("consumerCount", info.getConsumerCount());
            props.put("exists", true);
        } else {
            props.put("queueName", queueName);
            props.put("exists", false);
        }
        return props;
    }

    /**
     * Elimina una cola en RabbitMQ.
     */
    public boolean deleteQueue(String queueName) {
        boolean result = rabbitAdmin.deleteQueue(queueName);
        System.out.println("[ADMIN-SERVICE] 🗑️ Cola eliminada: " + queueName + " (resultado=" + result + ")");
        return result;
    }

    /**
     * Purga todos los mensajes de una cola sin eliminar la estructura.
     */
    public void purgeQueue(String queueName) {
        rabbitAdmin.purgeQueue(queueName, false);
        System.out.println("[ADMIN-SERVICE] 🧹 Cola purgada: " + queueName);
    }
}
