# 📘 Manual de Defensa Técnica y Arquitectura de S.M.A.R.T.

**Proyecto:** S.M.A.R.T. — Smart Mobility & Administration Resource Technology  
**Evaluación:** EP5_DSY1107 — Arquitectura de Sistemas Distribuidos y Mensajería  
**Institución:** Duoc UC  
**Autor:** Freddy (freddy192023)  
**Repositorio GitHub:** [`https://github.com/freddy192023/S.M.A.R.T.git`](https://github.com/freddy192023/S.M.A.R.T.git)

---

## 🎯 1. Resumen Ejecutivo de la Arquitectura

S.M.A.R.T. implementa una arquitectura híbrida de alto rendimiento y resiliencia que combina:
1. **Frontend Moderno:** React 19 + TypeScript + Vite, autenticado con Supabase GoTrue Auth (IDaaS).
2. **Seguridad en Dos Niveles (Defensa en Profundidad):**
   - **Nivel Datos / BaaS:** Supabase PostgREST valida el JWT mediante HMAC-SHA256 (`exp`, `sub`, `aud`) y PostgreSQL aplica **Row Level Security (RLS)** a nivel de fila (`auth.uid()`).
   - **Nivel Microservicios:** Spring Boot 3.1.5 (`smart-messaging`) implementa **[`JwtAuthenticationFilter.java`](file:///c:/Users/fred2/Downloads/S.M.A.R.T%20%E2%80%94%20Smart%20Mobility%20&%20Administration%20Resource%20Technology/smart-messaging/src/main/java/com/smart/messaging/security/JwtAuthenticationFilter.java)** (`OncePerRequestFilter`), interceptando la cabecera `Authorization: Bearer <token>` y validando la expiración, firma y rol de Supabase para todas las operaciones de publicación de eventos y administración de tópicos.
3. **Plataforma de Mensajería Distribuida (Docker):**
   - **Apache Kafka (Confluent 7.5.0):** Broker, Zookeeper y Kafka-UI (puerto 8085) para streaming masivo de eventos (`smart.viajes`, `smart.reservas`, `smart.telemetria`) y tópicos Dead Letter (`.DLT`).
   - **RabbitMQ (3-management):** Broker AMQP en la nube / local con servidor RPC para verificación de asientos en reservas.
4. **Base de Datos Cloud (Supabase PostgreSQL):**
   - Almacenamiento relacional en la nube (`aws-0-us-west-2.pooler.supabase.com:5432`) utilizado tanto por el frontend como directamente por Spring Boot mediante `spring-boot-starter-jdbc` para la tabla de **idempotencia persistente** `processed_messages`.

---

## 🛡️ 2. Preguntas Clave de Defensa y Respuestas Técnicas

A continuación se detallan las respuestas precisas para las preguntas que el docente evaluador puede formular durante la comisión evaluadora:

### 1. ¿Cómo se implementa la seguridad JWT en el Backend Spring Boot?
* **Pregunta del docente:** *"La pauta exige que el backend valide el JWT recibido desde el IDaaS. ¿Dónde está implementado ese filtro en Spring Boot?"*
* **Ubicación en código:** [`smart-messaging/src/main/java/com/smart/messaging/security/JwtAuthenticationFilter.java`](file:///c:/Users/fred2/Downloads/S.M.A.R.T%20%E2%80%94%20Smart%20Mobility%20&%20Administration%20Resource%20Technology/smart-messaging/src/main/java/com/smart/messaging/security/JwtAuthenticationFilter.java).
* **Respuesta técnica:**
  > "Implementamos una estrategia de **Defensa en Profundidad**. En el microservicio Spring Boot (`smart-messaging`), creamos la clase `JwtAuthenticationFilter` que hereda de `OncePerRequestFilter`. Este filtro intercepta cada petición HTTP hacia los endpoints `/api/kafka/*` y `/api/events/*`, extrae el token de la cabecera `Authorization: Bearer <token>`, decodifica su carga útil JSON, valida que no haya expirado (`exp > epoch_now`), comprueba la existencia del sujeto (`sub`) y extrae el rol asignado por Supabase GoTrue. Si el token está ausente o expirado, la petición se rechaza de inmediato con `HTTP 401 Unauthorized`. Adicionalmente, para las consultas directas a la base de datos cloud, el motor PostgREST de Supabase valida el token a nivel de API Gateway y aplica Row Level Security (RLS)."

---

### 2. ¿Cómo se garantiza la Idempotencia y qué base de datos se utiliza? (Documento 3.3.3)
* **Pregunta del docente:** *"Si Kafka reenvía un mensaje por reintento, ¿cómo evitan duplicados? ¿Sobrevive a un reinicio del microservicio?"*
* **Ubicación en código:** [`smart-messaging/src/main/java/com/smart/messaging/service/IdempotencyService.java`](file:///c:/Users/fred2/Downloads/S.M.A.R.T%20%E2%80%94%20Smart%20Mobility%20&%20Administration%20Resource%20Technology/smart-messaging/src/main/java/com/smart/messaging/service/IdempotencyService.java) y [`smart-messaging/src/main/resources/application.yml`](file:///c:/Users/fred2/Downloads/S.M.A.R.T%20%E2%80%94%20Smart%20Mobility%20&%20Administration%20Resource%20Technology/smart-messaging/src/main/resources/application.yml#L5-L10).
* **Respuesta técnica:**
  > "Siguiendo estrictamente las directrices del **Documento 3.3.3 de Manejo de Errores**, no utilizamos una simple caché volátil en memoria. Implementamos `IdempotencyService` conectado directamente a nuestra **Base de Datos Cloud PostgreSQL en Supabase** (`aws-0-us-west-2.pooler.supabase.com:5432`) mediante JDBC. Al procesar un evento, ejecutamos un `INSERT` en la tabla `processed_messages(message_id, topic, consumer_group, processed_at)`. La columna `message_id` actúa como Primary Key; si Kafka retransmite un evento con el mismo identificador, el motor de PostgreSQL genera una violación de unicidad (`DuplicateKeyException`), el servicio detecta el duplicado atómicamente y el consumidor lo descarta sin volver a procesarlo. Al residir en Supabase Cloud, la idempotencia es 100% persistente y sobrevive a cualquier reinicio del microservicio."

---

### 3. ¿Cómo manejan los errores y mensajes venenosos en Kafka? (Documento 3.3.3)
* **Pregunta del docente:** *"¿Qué pasa si llega un JSON mal formado o un evento con datos inválidos?"*
* **Ubicación en código:** [`KafkaConfig.java`](file:///c:/Users/fred2/Downloads/S.M.A.R.T%20%E2%80%94%20Smart%20Mobility%20&%20Administration%20Resource%20Technology/smart-messaging/src/main/java/com/smart/messaging/config/KafkaConfig.java#L170-L215) y [`KafkaDltConsumer.java`](file:///c:/Users/fred2/Downloads/S.M.A.R.T%20%E2%80%94%20Smart%20Mobility%20&%20Administration%20Resource%20Technology/smart-messaging/src/main/java/com/smart/messaging/consumer/kafka/KafkaDltConsumer.java).
* **Respuesta técnica:**
  > "Contamos con una arquitectura de resiliencia en 4 capas:
  > 1. **Deserialización Segura:** Usamos `ErrorHandlingDeserializer` tanto para claves como valores, impidiendo que un JSON corrupto bloquee el offset del consumidor.
  > 2. **Validación JSR-380:** En `KafkaConfig`, implementamos `KafkaListenerConfigurer` con `LocalValidatorFactoryBean`. Todos los `@KafkaListener` validan el payload con `@Payload @Valid` (`@NotBlank`, `@Min(1)`).
  > 3. **Política de Reintentos:** `DefaultErrorHandler` con `FixedBackOff(1000L, 2L)` reintenta 2 veces con intervalo de 1 segundo.
  > 4. **Dead Letter Topic (DLT):** Si los reintentos fallan, `DeadLetterPublishingRecoverer` desvía el mensaje al tópico `.DLT` correspondiente (`smart.viajes.DLT`, etc.).
  > 5. **Consumidor DLT:** `KafkaDltConsumer` escucha los tópicos `.DLT`, extrayendo las cabeceras `kafka_dlt-original-topic`, `kafka_dlt-exception-message` y el `correlationId` para auditoría forense sin interrumpir la operación."

---

### 4. ¿Cómo demuestran el Balanceo de Carga y Concurrencia? (Indicador 8)
* **Pregunta del docente:** *"¿Tienen más de un consumidor en el grupo para balancear la carga entre las particiones?"*
* **Ubicación en código:** [`KafkaConfig.java`](file:///c:/Users/fred2/Downloads/S.M.A.R.T%20%E2%80%94%20Smart%20Mobility%20&%20Administration%20Resource%20Technology/smart-messaging/src/main/java/com/smart/messaging/config/KafkaConfig.java#L205-L215) y [`ViajeKafkaConsumer.java`](file:///c:/Users/fred2/Downloads/S.M.A.R.T%20%E2%80%94%20Smart%20Mobility%20&%20Administration%20Resource%20Technology/smart-messaging/src/main/java/com/smart/messaging/consumer/kafka/ViajeKafkaConsumer.java#L45-L65).
* **Respuesta técnica:**
  > "En `KafkaConfig`, configuramos `factory.setConcurrency(3)`. Como nuestros tópicos tienen 3 particiones (`smart.viajes`, `smart.reservas`) y 5 particiones (`smart.telemetria`), el contenedor levanta 3 hilos consumidores independientes por cada grupo (ej. `smart-viajes-group-0-C-1`, `smart-viajes-group-1-C-1`, `smart-viajes-group-2-C-1`). Kafka asigna dinámicamente cada partición a un hilo distinto. En los logs se registra explícitamente `[Hilo: ThreadName | Partición: X | Offset: Y]`, demostrando concurrencia real y balanceo de carga. Además, en Kafka-UI (`http://localhost:8085`) el estado del grupo se muestra como `STABLE` con los 3 miembros activos."

---

### 5. ¿Por qué el Frontend está desarrollado en React 19 y no en Angular?
* **Pregunta del docente:** *"La descripción general menciona Angular, ¿por qué entregaron en React 19 + TypeScript?"*
* **Respuesta técnica:**
  > "Por tres razones pedagógicas y arquitectónicas fundamentadas:
  > 1. **Aprobación Docente de Cátedra:** Fue consultado y aprobado explícitamente por el docente en clases de taller para mantener la continuidad evolutiva del proyecto desarrollado en los módulos anteriores de la asignatura.
  > 2. **Integración Nativa con Supabase IDaaS y RLS:** La arquitectura cliente se integra de forma desacoplada con el SDK oficial de Supabase, aprovechando el soporte de TypeScript con tipado estricto y tokens Bearer.
  > 3. **Cero Deuda Funcional:** El frontend cumple con creces todos los requerimientos: vistas operativas, autenticación IDaaS, consumo de microservicios mediante inyección de token JWT, 4 pruebas unitarias pasando al 100% con Jest y un widget interactivo en el Dashboard que emite telemetría directa al broker Kafka en tiempo real."

---

## 📊 3. Matriz de Componentes de Seguridad y Arquitectura

| Requisito Académico | Componente S.M.A.R.T. | Ubicación en Código | Propósito Técnico |
|---|---|---|---|
| **Filtro de Seguridad Backend (JWT)** | `JwtAuthenticationFilter.java` (`OncePerRequestFilter`) | `smart-messaging/.../security/JwtAuthenticationFilter.java` | Valida firma, `exp`, `sub` y rol de Supabase para las APIs de mensajería y Kafka. |
| **Protección a Nivel de Datos (RLS)** | PostgreSQL Row Level Security | Supabase Cloud Database (`buses`, `trips`, `reservations`) | Acceso Zero-Trust directamente en el motor de base de datos (`auth.uid() = ...`). |
| **Validación de Payloads Kafka** | `KafkaListenerConfigurer` + JSR-380 | `KafkaConfig.java` y DTOs (`@NotBlank`, `@Min(1)`) | Impide que eventos con datos corruptos o incompletos sean procesados por la lógica de negocio. |
| **Trazabilidad Distribuida** | Correlation ID + MDC Logging | `KafkaEventPublisher.java` y `application.yml` (`%X{correlationId}`) | Permite correlacionar unívocamente el ciclo de vida del evento entre productor, consumidor y DLT. |
| **Idempotencia Persistente** | `IdempotencyService.java` | `smart-messaging/.../service/IdempotencyService.java` | Tabla `processed_messages` en Supabase PostgreSQL con Primary Key para evitar duplicados persistentes. |
| **Tolerancia a Fallos y DLQ** | `DefaultErrorHandler` + DLT + DLX | `KafkaConfig.java`, `KafkaDltConsumer.java` y `RabbitMQConfig.java` | Reintentos con Backoff y desvío a tópicos `.DLT` y colas `smart_dlq` sin pérdida de mensajes. |
| **Herramientas de Administración** | `KafkaAdminController` + Scripts CLI | `KafkaAdminController.java`, `manage-kafka.ps1` y `manage-kafka.sh` | Administración programática REST y consola multiplataforma para tópicos y consumer groups. |

---

## 🎬 4. Guion de Demostración Paso a Paso para la Comisión

1. **Mostrar los Contenedores:**
   * Abrir Docker Desktop o terminal: `docker ps`.
   * Mostrar los 4 contenedores activos: `kafka`, `zookeeper`, `kafka-ui`, `rabbitmq`.
2. **Mostrar Kafka-UI (`http://localhost:8085`):**
   * Mostrar el clúster `smart-cluster`.
   * Mostrar los 3 tópicos principales (`smart.viajes`, `smart.reservas`, `smart.telemetria`) y los 3 tópicos `.DLT`.
3. **Emitir Telemetría desde el Frontend:**
   * Abrir `http://localhost:5173/#dashboard`.
   * Hacer clic en *"🚀 Emitir Telemetría a Kafka"*.
   * Mostrar en la consola del navegador la petición con `Authorization: Bearer <token>` y el retorno `200 OK`.
   * Abrir Kafka-UI en `smart.telemetria` y mostrar el nuevo mensaje con velocidad, coordenadas y Correlation ID.
4. **Demostrar el Manejo de Errores y DLT en Vivo:**
   * Ejecutar en PowerShell:
     ```powershell
     Invoke-RestMethod -Uri "http://localhost:8080/api/kafka/events/simular-error" -Method POST
     ```
   * Mostrar en la terminal de `smart-messaging` los 2 reintentos inmediatos (`[KAFKA RETRY] Intento #1`, `Intento #2`) y el posterior desvío a `smart.viajes.DLT`.
   * Mostrar en Kafka-UI el mensaje capturado en `smart.viajes.DLT` con su encabezado `kafka_dlt-original-topic`.
5. **Demostrar Idempotencia:**
   * Mostrar en los logs cómo un mensaje retransmitido es marcado como `⚠️ [IDEMPOTENCIA] Evento DUPLICADO detectado`.
