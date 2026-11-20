# ⚡ Documentación Completa del Módulo Apache Kafka — S.M.A.R.T.

Este documento contiene la especificación técnica, topología de tópicos, endpoints REST de administración, estrategia de tolerancia a fallos (DLT) y comandos de prueba para el módulo de streaming de **S.M.A.R.T. (Smart Mobility & Administration Resource Technology)**.

---

## 🏗️ 1. Infraestructura Docker

La plataforma de mensajería corre localmente mediante Docker Compose:

* **Zookeeper:** `confluentinc/cp-zookeeper:7.5.0` (Puerto `2181`)
* **Kafka Broker:** `confluentinc/cp-kafka:7.5.0` (Puertos `9092` externo / `29092` interno)
* **Kafka-UI:** `provectuslabs/kafka-ui:latest` (Puerto `8085` -> [http://localhost:8085](http://localhost:8085))

```bash
# Levantar clúster:
docker compose -f docker-compose.kafka.yml up -d
```

---

## 📊 2. Topología de Tópicos y Consumer Groups

| Tópico | Particiones | Replicación | Consumer Group | Propósito |
|---|:---:|:---:|---|---|
| `smart.viajes` | 3 | 1 | `smart-viajes-group` | Eventos de programación, despacho y actualización de viajes |
| `smart.reservas` | 3 | 1 | `smart-reservas-group` | Emisión, confirmación y anulación de pasajes |
| `smart.telemetria` | 5 | 1 | `smart-telemetria-group` | Streaming de alta frecuencia IoT (GPS, velocidad, alertas) |
| `smart.viajes.DLT` | 1 | 1 | `smart-dlt-group` | Dead Letter Topic para mensajes fallidos de viajes |
| `smart.reservas.DLT` | 1 | 1 | `smart-dlt-group` | Dead Letter Topic para reservas corruptas |
| `smart.telemetria.DLT` | 1 | 1 | `smart-dlt-group` | Dead Letter Topic para anomalías en telemetría |

---

## 🛡️ 3. Tolerancia a Fallos, Reintentos y Dead Letter Topic (DLT)

* **Idempotencia:** Los consumidores validan `eventoId` mediante caché concurrente en memoria para descartar eventos duplicados.
* **Manejo de Errores:** Configurado con `DefaultErrorHandler` y `FixedBackOff(1000L, 2L)` (2 reintentos con intervalo de 1 segundo).
* **Dead Letter Topic (.DLT):** Si un mensaje supera los reintentos o tiene un formato no conforme, `DeadLetterPublishingRecoverer` lo desvía automáticamente a `<topico>.DLT`.
* **Consumidor DLT:** `KafkaDltConsumer` escucha todos los tópicos `.DLT` y archiva el error con encabezados de causa raíz (`kafka_dlt-original-topic`, `kafka_dlt-exception-message`).

---

## 🛠️ 4. API REST de Administración (Endpoints)

Base URL: `http://localhost:8080/api/kafka`

### 1. Listar Tópicos
```http
GET /api/kafka/topics
```

### 2. Crear Tópico Dinámicamente
```http
POST /api/kafka/topics
Content-Type: application/json

{
  "topicName": "smart.alertas",
  "partitions": 3,
  "replicationFactor": 1,
  "retentionMs": 604800000,
  "cleanupPolicy": "delete"
}
```

### 3. Describir Tópico
```http
GET /api/kafka/topics/smart.viajes
```

### 4. Eliminar Tópico
```http
DELETE /api/kafka/topics/smart.alertas
```

### 5. Listar Consumer Groups
```http
GET /api/kafka/consumer-groups
```

---

## 🚀 5. API de Publicación de Eventos (Testing)

Base URL: `http://localhost:8080/api/kafka/events`

* **Viaje:** `POST /api/kafka/events/viaje`
  ```json
  {
    "viajeId": "V-101",
    "busId": "BUS-04",
    "conductorId": "COND-02",
    "origen": "Santiago",
    "destino": "Valparaíso",
    "fechaSalida": "2026-11-20T08:00:00",
    "estado": "PROGRAMADO"
  }
  ```
* **Telemetría con Alerta:** `POST /api/kafka/events/telemetria`
  ```json
  {
    "busId": "BUS-04",
    "viajeId": "V-101",
    "latitud": -33.4489,
    "longitud": -70.6693,
    "velocidadKmh": 115.5,
    "nivelCombustible": 85.0,
    "alerta": "EXCESO_VELOCIDAD"
  }
  ```
* **Simular Error DLT:** `POST /api/kafka/events/simular-error`

---

## 💻 6. Script de Gestión por Consola (CLI)

En PowerShell:
```powershell
# Estado del clúster:
.\scripts\manage-kafka.ps1 status

# Listar tópicos:
.\scripts\manage-kafka.ps1 list-topics

# Ver grupos de consumidores:
.\scripts\manage-kafka.ps1 consumer-groups

# Enviar mensaje de prueba:
.\scripts\manage-kafka.ps1 produce-test smart.viajes '{"viajeId":"V-999","estado":"PRUEBA"}'

# Consumir mensajes:
.\scripts\manage-kafka.ps1 consume-test smart.viajes
```

