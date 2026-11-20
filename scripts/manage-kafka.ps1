<#
.SYNOPSIS
    Script de Gestión y Administración de la Plataforma Apache Kafka (Bloque 5.4)
    Proyecto S.M.A.R.T. - Smart Mobility & Administration Resource Technology

.DESCRIPTION
    Permite crear tópicos, listar tópicos, inspeccionar consumer groups y
    probar productores/consumidores desde la línea de comandos usando el contenedor Docker.
#>

param (
    [Parameter(Position=0)]
    [ValidateSet("status", "list-topics", "create-topic", "describe-topic", "delete-topic", "consumer-groups", "produce-test", "consume-test", "help")]
    [string]$Action = "help",

    [Parameter(Position=1)]
    [string]$TopicName,

    [Parameter(Position=2)]
    [int]$Partitions = 3,

    [Parameter(Position=3)]
    [string]$Message
)

$KAFKA_CONTAINER = "kafka"
$BOOTSTRAP_SERVER = "localhost:9092"

function Check-KafkaRunning {
    $running = docker ps --filter "name=$KAFKA_CONTAINER" --filter "status=running" -q
    if (-not $running) {
        Write-Error "❌ El contenedor '$KAFKA_CONTAINER' no está en ejecución. Ejecuta 'docker compose -f docker-compose.kafka.yml up -d' primero."
        exit 1
    }
}

switch ($Action) {
    "status" {
        Check-KafkaRunning
        Write-Host "🟢 Comprobando estado de Kafka y Kafka-UI..." -ForegroundColor Cyan
        docker exec -it $KAFKA_CONTAINER kafka-broker-api-versions --bootstrap-server $BOOTSTRAP_SERVER | Select-Object -First 5
        Write-Host "✅ Broker Kafka operativo en $BOOTSTRAP_SERVER" -ForegroundColor Green
        Write-Host "🌐 Kafka-UI disponible en: http://localhost:8085" -ForegroundColor Yellow
    }

    "list-topics" {
        Check-KafkaRunning
        Write-Host "📋 Listando tópicos en Kafka..." -ForegroundColor Cyan
        docker exec -it $KAFKA_CONTAINER kafka-topics --bootstrap-server $BOOTSTRAP_SERVER --list
    }

    "create-topic" {
        Check-KafkaRunning
        if (-not $TopicName) {
            Write-Error "Debes indicar el nombre del tópico: .\manage-kafka.ps1 create-topic <nombre-topico> [particiones]"
            exit 1
        }
        Write-Host "⚙️ Creando tópico '$TopicName' con $Partitions particiones..." -ForegroundColor Cyan
        docker exec -it $KAFKA_CONTAINER kafka-topics --bootstrap-server $BOOTSTRAP_SERVER --create --topic $TopicName --partitions $Partitions --replication-factor 1
        Write-Host "✅ Tópico '$TopicName' creado exitosamente." -ForegroundColor Green
    }

    "describe-topic" {
        Check-KafkaRunning
        if (-not $TopicName) {
            Write-Error "Debes indicar el nombre del tópico: .\manage-kafka.ps1 describe-topic <nombre-topico>"
            exit 1
        }
        Write-Host "🔍 Detalle del tópico '$TopicName':" -ForegroundColor Cyan
        docker exec -it $KAFKA_CONTAINER kafka-topics --bootstrap-server $BOOTSTRAP_SERVER --describe --topic $TopicName
    }

    "delete-topic" {
        Check-KafkaRunning
        if (-not $TopicName) {
            Write-Error "Debes indicar el nombre del tópico a eliminar: .\manage-kafka.ps1 delete-topic <nombre-topico>"
            exit 1
        }
        Write-Host "🗑️ Eliminando tópico '$TopicName'..." -ForegroundColor Yellow
        docker exec -it $KAFKA_CONTAINER kafka-topics --bootstrap-server $BOOTSTRAP_SERVER --delete --topic $TopicName
        Write-Host "✅ Tópico '$TopicName' eliminado." -ForegroundColor Green
    }

    "consumer-groups" {
        Check-KafkaRunning
        Write-Host "👥 Grupos de Consumidores registrados en el clúster:" -ForegroundColor Cyan
        docker exec -it $KAFKA_CONTAINER kafka-consumer-groups --bootstrap-server $BOOTSTRAP_SERVER --list
    }

    "produce-test" {
        Check-KafkaRunning
        $target = if ($TopicName) { $TopicName } else { "smart.viajes" }
        $msg = if ($Message) { $Message } else { '{"viajeId":"V-999","busId":"BUS-01","estado":"PRUEBA_CLI"}' }
        Write-Host "📤 Enviando mensaje de prueba al tópico '$target': $msg" -ForegroundColor Cyan
        echo $msg | docker exec -i $KAFKA_CONTAINER kafka-console-producer --bootstrap-server $BOOTSTRAP_SERVER --topic $target
        Write-Host "✅ Mensaje enviado." -ForegroundColor Green
    }

    "consume-test" {
        Check-KafkaRunning
        $target = if ($TopicName) { $TopicName } else { "smart.viajes" }
        Write-Host "📥 Consumiendo mensajes desde el inicio (--from-beginning) de '$target' (Ctrl+C para salir):" -ForegroundColor Cyan
        docker exec -it $KAFKA_CONTAINER kafka-console-consumer --bootstrap-server $BOOTSTRAP_SERVER --topic $target --from-beginning --max-messages 10
    }

    Default {
        Write-Host "=== Script de Gestión Kafka (S.M.A.R.T.) ===" -ForegroundColor Yellow
        Write-Host "Uso: .\manage-kafka.ps1 <Acción> [Parámetros]"
        Write-Host ""
        Write-Host "Acciones disponibles:"
        Write-Host "  status                                  Verifica conexión con el broker"
        Write-Host "  list-topics                             Lista todos los tópicos"
        Write-Host "  create-topic <nombre> [particiones]     Crea un nuevo tópico"
        Write-Host "  describe-topic <nombre>                 Muestra particiones y configuración"
        Write-Host "  delete-topic <nombre>                   Elimina un tópico"
        Write-Host "  consumer-groups                         Lista los grupos de consumidores"
        Write-Host "  produce-test [topico] [mensaje]         Envía un mensaje de prueba"
        Write-Host "  consume-test [topico]                   Lee mensajes del tópico"
    }
}

