package com.duoc.kafka_streams_lab.config;

import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.Produced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafkaStreams;

@Configuration
@EnableKafkaStreams
public class KafkaStreamsTopology {

    public static final String TOPICO_ENTRADA = "origen-stream";
    public static final String TOPICO_SALIDA = "destino-stream";

    @Bean
    public KStream<String, String> kStream(StreamsBuilder builder) {
        KStream<String, String> stream = builder.stream(
            TOPICO_ENTRADA,
            Consumed.with(Serdes.String(), Serdes.String())
        );

        // Pipeline en tiempo real:
        // 1. Mostrar mensaje recibido
        // 2. Filtro: pasa si no es nulo y contiene 'URGENTE' o 'ALERTA'
        // 3. Map: transformar texto a mayusculas con prefijo
        // 4. Mostrar mensaje procesado
        KStream<String, String> streamFiltrado = stream
            .peek((key, value) -> System.out.println(">>> [ORIGEN RECIBIDO]: " + value))
            .filter((key, value) -> value != null && (value.toUpperCase().contains("URGENTE") || value.toUpperCase().contains("ALERTA")))
            .mapValues(value -> "[PROCESADO EN TIEMPO REAL] " + value.toUpperCase())
            .peek((key, value) -> System.out.println(">>> [DESTINO FILTRADO]: " + value));

        streamFiltrado.to(TOPICO_SALIDA, Produced.with(Serdes.String(), Serdes.String()));

        return streamFiltrado;
    }
}