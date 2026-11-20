#!/usr/bin/env bash
# ==============================================================================
# Script de Gestión y Administración de la Plataforma Apache Kafka (Bloque 5.4)
# Proyecto S.M.A.R.T. — Linux / macOS / WSL
# ==============================================================================

ACTION="${1:-help}"
TOPIC_NAME="$2"
PARTITIONS="${3:-3}"
MESSAGE="$4"

KAFKA_CONTAINER="kafka"
BOOTSTRAP_SERVER="localhost:9092"

check_kafka() {
  if ! docker ps --filter "name=$KAFKA_CONTAINER" --filter "status=running" -q | grep -q .; then
    echo "❌ El contenedor '$KAFKA_CONTAINER' no está en ejecución."
    echo "Ejecuta 'docker compose -f docker-compose.kafka.yml up -d' primero."
    exit 1
  fi
}

case "$ACTION" in
  status)
    check_kafka
    echo "🟢 Comprobando estado de Kafka y Kafka-UI..."
    docker exec -it "$KAFKA_CONTAINER" kafka-broker-api-versions --bootstrap-server "$BOOTSTRAP_SERVER" | head -n 5
    echo "✅ Broker Kafka operativo en $BOOTSTRAP_SERVER"
    echo "🌐 Kafka-UI disponible en: http://localhost:8085"
    ;;

  list-topics)
    check_kafka
    echo "📋 Listando tópicos en Kafka..."
    docker exec -it "$KAFKA_CONTAINER" kafka-topics --bootstrap-server "$BOOTSTRAP_SERVER" --list
    ;;

  create-topic)
    check_kafka
    if [ -z "$TOPIC_NAME" ]; then
      echo "❌ Debes indicar el nombre del tópico: ./manage-kafka.sh create-topic <nombre> [particiones]"
      exit 1
    fi
    echo "⚙️ Creando tópico '$TOPIC_NAME' con $PARTITIONS particiones..."
    docker exec -it "$KAFKA_CONTAINER" kafka-topics --bootstrap-server "$BOOTSTRAP_SERVER" --create --topic "$TOPIC_NAME" --partitions "$PARTITIONS" --replication-factor 1
    echo "✅ Tópico '$TOPIC_NAME' creado exitosamente."
    ;;

  describe-topic)
    check_kafka
    if [ -z "$TOPIC_NAME" ]; then
      echo "❌ Debes indicar el nombre del tópico: ./manage-kafka.sh describe-topic <nombre>"
      exit 1
    fi
    echo "🔍 Detalle del tópico '$TOPIC_NAME':"
    docker exec -it "$KAFKA_CONTAINER" kafka-topics --bootstrap-server "$BOOTSTRAP_SERVER" --describe --topic "$TOPIC_NAME"
    ;;

  delete-topic)
    check_kafka
    if [ -z "$TOPIC_NAME" ]; then
      echo "❌ Debes indicar el nombre del tópico a eliminar: ./manage-kafka.sh delete-topic <nombre>"
      exit 1
    fi
    echo "🗑️ Eliminando tópico '$TOPIC_NAME'..."
    docker exec -it "$KAFKA_CONTAINER" kafka-topics --bootstrap-server "$BOOTSTRAP_SERVER" --delete --topic "$TOPIC_NAME"
    echo "✅ Tópico '$TOPIC_NAME' eliminado."
    ;;

  consumer-groups)
    check_kafka
    echo "👥 Grupos de Consumidores registrados en el clúster:"
    docker exec -it "$KAFKA_CONTAINER" kafka-consumer-groups --bootstrap-server "$BOOTSTRAP_SERVER" --list
    ;;

  produce-test)
    check_kafka
    TARGET="${TOPIC_NAME:-smart.viajes}"
    MSG="${MESSAGE:-{\"viajeId\":\"V-999\",\"busId\":\"BUS-01\",\"estado\":\"PRUEBA_BASH\"}}"
    echo "📤 Enviando mensaje de prueba al tópico '$TARGET': $MSG"
    echo "$MSG" | docker exec -i "$KAFKA_CONTAINER" kafka-console-producer --bootstrap-server "$BOOTSTRAP_SERVER" --topic "$TARGET"
    echo "✅ Mensaje enviado."
    ;;

  consume-test)
    check_kafka
    TARGET="${TOPIC_NAME:-smart.viajes}"
    echo "📥 Consumiendo mensajes desde el inicio (--from-beginning) de '$TARGET':"
    docker exec -it "$KAFKA_CONTAINER" kafka-console-consumer --bootstrap-server "$BOOTSTRAP_SERVER" --topic "$TARGET" --from-beginning --max-messages 10
    ;;

  *)
    echo "=== Script de Gestión Kafka (S.M.A.R.T.) ==="
    echo "Uso: ./manage-kafka.sh <Acción> [Parámetros]"
    echo ""
    echo "Acciones disponibles:"
    echo "  status                                  Verifica conexión con el broker"
    echo "  list-topics                             Lista todos los tópicos"
    echo "  create-topic <nombre> [particiones]     Crea un nuevo tópico"
    echo "  describe-topic <nombre>                 Muestra particiones y configuración"
    echo "  delete-topic <nombre>                   Elimina un tópico"
    echo "  consumer-groups                         Lista los grupos de consumidores"
    echo "  produce-test [topico] [mensaje]         Envía un mensaje de prueba"
    echo "  consume-test [topico]                   Lee mensajes del tópico"
    ;;
esac

