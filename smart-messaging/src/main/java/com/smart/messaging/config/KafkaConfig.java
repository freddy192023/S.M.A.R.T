package com.smart.messaging.config;

import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.annotation.KafkaListenerConfigurer;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.KafkaListenerEndpointRegistrar;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.*;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.util.backoff.FixedBackOff;
import org.springframework.validation.Validator;

import java.util.HashMap;
import java.util.Map;

/**
 * ⚡ CONFIGURACIÓN INTEGRAL DE APACHE KAFKA (Bloque 4.1, 4.5, 4.6 y 5.2 - Doc 3.3.3)
 *
 * Configura:
 *  1. Tópicos de negocio iniciales (viajes, reservas, telemetría) y tópicos Dead Letter (.DLT).
 *  2. ProducerFactory y KafkaTemplate tipado.
 *  3. ConsumerFactory con deserializadores seguros (ErrorHandlingDeserializer).
 *  4. DefaultErrorHandler con DeadLetterPublishingRecoverer (DLT) y reintentos con BackOff.
 *  5. Bean AdminClient para la gestión programática y REST de la plataforma Kafka.
 *  6. Validación de Payloads en consumo con JSR-380 Validator (Documento 3.3.3).
 *  7. Concurrency = 3 para balanceo real de carga entre particiones (Indicador 8).
 */
@Configuration
@EnableKafka
public class KafkaConfig implements KafkaListenerConfigurer {

    private static final Logger log = LoggerFactory.getLogger(KafkaConfig.class);

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id:smart-messaging-group}")
    private String defaultGroupId;

    @Autowired
    private Validator validator;

    @Override
    public void configureKafkaListeners(KafkaListenerEndpointRegistrar registrar) {
        // 🌟 JSR-380 Validator para @Payload @Valid en @KafkaListener (Doc 3.3.3)
        registrar.setValidator(this.validator);
    }

    // ── Nombres de Tópicos Oficiales de S.M.A.R.T ─────────────────────────────
    public static final String TOPIC_VIAJES = "smart.viajes";
    public static final String TOPIC_RESERVAS = "smart.reservas";
    public static final String TOPIC_TELEMETRIA = "smart.telemetria";

    // Dead Letter Topics (DLT) para recuperación de mensajes fallidos
    public static final String TOPIC_VIAJES_DLT = "smart.viajes.DLT";
    public static final String TOPIC_RESERVAS_DLT = "smart.reservas.DLT";
    public static final String TOPIC_TELEMETRIA_DLT = "smart.telemetria.DLT";

    // ── 1. Declaración Automática de Tópicos (Bloque 5.2) ─────────────────────

    @Bean
    public NewTopic topicViajes() {
        return TopicBuilder.name(TOPIC_VIAJES)
                .partitions(3)
                .replicas(1)
                .config("retention.ms", "604800000") // 7 días
                .config("cleanup.policy", "delete")
                .build();
    }

    @Bean
    public NewTopic topicReservas() {
        return TopicBuilder.name(TOPIC_RESERVAS)
                .partitions(3)
                .replicas(1)
                .config("retention.ms", "604800000")
                .config("cleanup.policy", "delete")
                .build();
    }

    @Bean
    public NewTopic topicTelemetria() {
        // Mayor número de particiones para streaming de alta frecuencia IoT
        return TopicBuilder.name(TOPIC_TELEMETRIA)
                .partitions(5)
                .replicas(1)
                .config("retention.ms", "86400000") // 24 horas para telemetría
                .config("cleanup.policy", "delete")
                .build();
    }

    // Tópicos Dead Letter (DLT)
    @Bean
    public NewTopic topicViajesDlt() {
        return TopicBuilder.name(TOPIC_VIAJES_DLT).partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic topicReservasDlt() {
        return TopicBuilder.name(TOPIC_RESERVAS_DLT).partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic topicTelemetriaDlt() {
        return TopicBuilder.name(TOPIC_TELEMETRIA_DLT).partitions(1).replicas(1).build();
    }

    // ── 2. AdminClient para Administración REST de Kafka (Bloque 5.1) ─────────
    @Bean
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        return new KafkaAdmin(configs);
    }

    @Bean
    public AdminClient adminClient(KafkaAdmin kafkaAdmin) {
        return AdminClient.create(kafkaAdmin.getConfigurationProperties());
    }

    // ── 3. Producer Factory & KafkaTemplate (Bloque 4.3) ──────────────────────
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        configProps.put(ProducerConfig.ACKS_CONFIG, "all");
        configProps.put(ProducerConfig.RETRIES_CONFIG, 3);
        configProps.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, true);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate(ProducerFactory<String, Object> producerFactory) {
        return new KafkaTemplate<>(producerFactory);
    }

    // ── 4. Consumer Factory (Bloque 4.1 y 4.5) ────────────────────────────────
    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, defaultGroupId);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);

        // Uso de ErrorHandlingDeserializer para tolerar payloads corruptos sin botar el consumidor
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        props.put(ErrorHandlingDeserializer.KEY_DESERIALIZER_CLASS, StringDeserializer.class);
        props.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);

        props.put(JsonDeserializer.TRUSTED_PACKAGES, "com.smart.messaging.dto,java.util,java.lang");
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, "java.lang.Object");

        return new DefaultKafkaConsumerFactory<>(props);
    }

    // ── 5. Manejo de Errores con DLT y Reintentos (Bloque 4.5 - Doc 3.3.3) ───
    @Bean
    public DefaultErrorHandler errorHandler(KafkaTemplate<String, Object> kafkaTemplate) {
        DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(kafkaTemplate,
                (record, exception) -> {
                    log.error("☠️ [KAFKA DLT] Mensaje defectuoso desviado a DLT. Tópico: {} | Causa: {}",
                            record.topic(), exception.getMessage());
                    return new TopicPartition(record.topic() + ".DLT", record.partition());
                });

        // 2 reintentos con intervalo de 1000ms antes de desviar al DLT
        FixedBackOff backOff = new FixedBackOff(1000L, 2L);
        DefaultErrorHandler errorHandler = new DefaultErrorHandler(recoverer, backOff);

        errorHandler.setRetryListeners((record, ex, deliveryAttempt) -> {
            log.warn("⚠️ [KAFKA RETRY] Intento #{} fallido para tópico '{}' | Error: {}",
                    deliveryAttempt, record.topic(), ex.getMessage());
        });

        return errorHandler;
    }

    // ── 6. Listener Container Factory con Validación y Balanceo Concurrente ───
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory(
            ConsumerFactory<String, Object> consumerFactory,
            DefaultErrorHandler errorHandler) {

        ConcurrentKafkaListenerContainerFactory<String, Object> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory);
        factory.setCommonErrorHandler(errorHandler);
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.RECORD);

        // 🌟 3 hilos concurrentes para balancear particiones en el grupo (Indicador 8)
        factory.setConcurrency(3);

        return factory;
    }
}
