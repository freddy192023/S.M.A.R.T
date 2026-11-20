package com.smart.messaging.service;

import com.smart.messaging.dto.KafkaTopicRequest;
import com.smart.messaging.dto.KafkaTopicResponse;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.common.config.ConfigResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

/**
 * 🛠️ SERVICIO ADMINISTRADOR DE KAFKA (Bloque 5.1, 5.2 y 5.3)
 *
 * Utiliza Apache Kafka AdminClient para gestionar programáticamente:
 *  - Creación de tópicos con particiones, replicación, retención y cleanup.policy.
 *  - Listado y detalle de tópicos existentes.
 *  - Eliminación controlada de tópicos.
 *  - Inspección de Consumer Groups activos y sus miembros.
 */
@Service
public class KafkaAdminService {

    private static final Logger log = LoggerFactory.getLogger(KafkaAdminService.class);

    @Autowired
    private AdminClient adminClient;

    /**
     * 5.1 y 5.2: Crear un nuevo tópico con parámetros avanzados
     */
    public void createTopic(KafkaTopicRequest request) throws ExecutionException, InterruptedException {
        NewTopic newTopic = new NewTopic(request.getTopicName(), request.getPartitions(), request.getReplicationFactor());
        newTopic.configs(request.toTopicConfigs());

        adminClient.createTopics(Collections.singleton(newTopic)).all().get();
        log.info("✅ [KAFKA ADMIN] Tópico '{}' creado con {} particiones y retención {} ms",
                request.getTopicName(), request.getPartitions(), request.getRetentionMs());
    }

    /**
     * 5.1: Listar todos los tópicos con sus configuraciones
     */
    public List<KafkaTopicResponse> listTopics() throws ExecutionException, InterruptedException {
        ListTopicsResult listTopicsResult = adminClient.listTopics(new ListTopicsOptions().listInternal(false));
        Set<String> topicNames = listTopicsResult.names().get();

        if (topicNames.isEmpty()) {
            return Collections.emptyList();
        }

        DescribeTopicsResult describeTopicsResult = adminClient.describeTopics(topicNames);
        Map<String, TopicDescription> descriptions = describeTopicsResult.allTopicNames().get();

        List<KafkaTopicResponse> responseList = new ArrayList<>();
        for (Map.Entry<String, TopicDescription> entry : descriptions.entrySet()) {
            String name = entry.getKey();
            TopicDescription desc = entry.getValue();

            int partitions = desc.partitions().size();
            int replicas = desc.partitions().isEmpty() ? 1 : desc.partitions().get(0).replicas().size();

            responseList.add(new KafkaTopicResponse(name, partitions, replicas, desc.isInternal(), Collections.emptyMap()));
        }

        return responseList;
    }

    /**
     * 5.1 y 5.2: Describir un tópico específico con sus configuraciones avanzadas
     */
    public KafkaTopicResponse describeTopic(String topicName) throws ExecutionException, InterruptedException {
        TopicDescription desc = adminClient.describeTopics(Collections.singleton(topicName))
                .allTopicNames().get().get(topicName);

        ConfigResource resource = new ConfigResource(ConfigResource.Type.TOPIC, topicName);
        DescribeConfigsResult configsResult = adminClient.describeConfigs(Collections.singleton(resource));
        Config config = configsResult.all().get().get(resource);

        Map<String, String> configMap = new HashMap<>();
        config.entries().forEach(entry -> {
            if ("retention.ms".equals(entry.name()) || "cleanup.policy".equals(entry.name()) || "max.message.bytes".equals(entry.name())) {
                configMap.put(entry.name(), entry.value());
            }
        });

        int partitions = desc.partitions().size();
        int replicas = desc.partitions().isEmpty() ? 1 : desc.partitions().get(0).replicas().size();

        return new KafkaTopicResponse(topicName, partitions, replicas, desc.isInternal(), configMap);
    }

    /**
     * 5.1: Eliminar un tópico
     */
    public void deleteTopic(String topicName) throws ExecutionException, InterruptedException {
        adminClient.deleteTopics(Collections.singleton(topicName)).all().get();
        log.info("🗑️ [KAFKA ADMIN] Tópico '{}' eliminado exitosamente", topicName);
    }

    /**
     * 5.3: Listar todos los grupos de consumidores
     */
    public List<Map<String, Object>> listConsumerGroups() throws ExecutionException, InterruptedException {
        Collection<ConsumerGroupListing> listings = adminClient.listConsumerGroups().all().get();

        return listings.stream().map(g -> {
            Map<String, Object> map = new HashMap<>();
            map.put("groupId", g.groupId());
            map.put("isSimpleConsumerGroup", g.isSimpleConsumerGroup());
            map.put("state", g.state().map(Enum::name).orElse("UNKNOWN"));
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * 5.3: Describir un grupo de consumidores específico (miembros, estado, particiones)
     */
    public Map<String, Object> describeConsumerGroup(String groupId) throws ExecutionException, InterruptedException {
        ConsumerGroupDescription desc = adminClient.describeConsumerGroups(Collections.singleton(groupId))
                .describedGroups().get(groupId).get();

        Map<String, Object> result = new HashMap<>();
        result.put("groupId", desc.groupId());
        result.put("state", desc.state().name());
        result.put("partitionAssignor", desc.partitionAssignor());
        result.put("coordinator", desc.coordinator().host() + ":" + desc.coordinator().port());

        List<Map<String, Object>> members = desc.members().stream().map(m -> {
            Map<String, Object> memberMap = new HashMap<>();
            memberMap.put("memberId", m.consumerId());
            memberMap.put("clientId", m.clientId());
            memberMap.put("host", m.host());
            memberMap.put("assignedPartitionsCount", m.assignment().topicPartitions().size());
            return memberMap;
        }).collect(Collectors.toList());

        result.put("members", members);
        return result;
    }
}

