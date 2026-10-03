# 🐇 Documentación Completa del Módulo de Mensajería (RabbitMQ / CloudAMQP)

Este documento contiene toda la información técnica, credenciales, estructura de colas, endpoints Serverless y cómo ejecutar las pruebas de carga para el módulo de mensajería asíncrona de **S.M.A.R.T.**.

---

## 🔑 1. Credenciales de Acceso a CloudAMQP (RabbitMQ)

Para acceder al **Panel de Administración Web (Management UI)** o conectar un backend consumer (Java / Node.js):

| Parámetro | Valor |
|---|---|
| **Host / Server** | `shark.rmq.cloudamqp.com` |
| **Virtual Host (vhost)** | `upzhvdpi` |
| **Usuario (Username)** | `upzhvdpi` |
| **Contraseña (Password)** | `uQeQBUACo1mXOIuYq2Rta87dczLjEkHa` |
| **URL AMQPS (SSL - Puerto 5671)** | `amqps://upzhvdpi:uQeQBUACo1mXOIuYq2Rta87dczLjEkHa@shark.rmq.cloudamqp.com/upzhvdpi` |
| **HTTP Management API** | `https://shark.rmq.cloudamqp.com/api/` |
| **Exchange Principal** | `s.m.a.r.t_exchange` |

---

## 📊 2. Arquitectura de Colas y Exchanges

El sistema utiliza un modelo **Publish / Subscribe (Pub/Sub)** y **Routing Keys** para canalizar mensajes desde las funciones Serverless en Vercel hacia los consumidores en Java.

```
                  ┌──────────────────────┐
                  │   Vercel Serverless  │
                  │   (/api/confirmar)   │
                  └──────────┬───────────┘
                             │ HTTP POST / Publish
                             ▼
                  ┌──────────────────────┐
                  │   s.m.a.r.t_exchange │ (Topic Exchange)
                  └──────────┬───────────┘
         ┌───────────────────┼───────────────────┬───────────────────┐
         │ reserva.creada    │ reserva.cancelada │ viaje.programado  │ log.* / log.error
         ▼                   ▼                   ▼                   ▼
┌──────────────────┐┌──────────────────┐┌──────────────────┐┌──────────────────┐
│reserva_creada    ││reserva_cancelada ││viaje_programado  ││logs_queue        │
│_queue            ││_queue            ││_queue            ││errors_only_queue │
└────────┬─────────┘└────────┬─────────┘└────────┬─────────┘└────────┬─────────┘
         │                   │                   │                   │
         └───────────────────┼───────────────────┴───────────────────┘
                             ▼ (AMQP Consumer)
                  ┌──────────────────────┐
                  │ Docker (Java Backend)│
                  └──────────────────────┘
```

### Detalle de Colas Activas

| Nombre de la Cola | Routing Key | Descripción / Función |
|---|---|---|
| `reserva_creada_queue` | `reserva.creada` | Eventos de reservas confirmadas por pasajeros |
| `reserva_cancelada_queue` | `reserva.cancelada` | Eventos de anulación o cancelación de reservas |
| `viaje_programado_queue` | `viaje.programado` | Notificación de nuevos viajes dados de alta |
| `logs_queue` | `log.*` | Cola centralizada de auditoría (recibe copia de todos los eventos) |
| `errors_only_queue` | `log.error` | Almacena únicamente errores críticos del sistema |
| `smart.reserva.email` | `reserva.email` | Envío asíncrono de confirmaciones por correo |
| `seat_check_rpc_queue` | `seat.check` | RPC síncrono para validación de disponibilidad |

---

## ⚡ 3. Endpoints Vercel Serverless (Productores)

Los eventos se publican mediante las API Serverless en Node.js ([api/lib/rabbitmq.js](file:///c:/Users/fred2/Downloads/S.M.A.R.T%20%E2%80%94%20Smart%20Mobility%20&%20Administration%20Resource%20Technology/api/lib/rabbitmq.js)):

1. **`POST /api/confirmar`**
   - Payload: `{ viajeId, asiento, pasajero }`
   - Publica en: `reserva_creada_queue` y `logs_queue`
2. **`POST /api/cancelar`**
   - Payload: `{ viajeId, asiento, pasajero, reservaCode }`
   - Publica en: `reserva_cancelada_queue` y `logs_queue`
3. **`POST /api/viaje`**
   - Payload: `{ viajeId, ruta, conductor, fecha }`
   - Publica en: `viaje_programado_queue` y `logs_queue`
4. **`POST /api/log-error`**
   - Payload: `{ mensaje, codigo }`
   - Publica en: `errors_only_queue` y `logs_queue`

---

## 🧪 4. Pruebas de Carga y Simulación (Locust)

Se tienen 3 herramientas para simular tráfico masivo en las colas:

### A) Simulación Web Interactiva (Recomendada)
- Abre el archivo local [scripts/locust-web.html](file:///c:/Users/fred2/Downloads/S.M.A.R.T%20%E2%80%94%20Smart%20Mobility%20&%20Administration%20Resource%20Technology/scripts/locust-web.html) en tu navegador.
- Permite configurar número de usuarios concurrentes, tasa de envío y ver estadísticas en tiempo real de los 4 endpoints.

### B) Script nativo de Locust (Python)
- Ejecutar en consola:
  ```bash
  locust -f scripts/locustfile.py --host=https://s-m-a-r-t-six.vercel.app
  ```
- Abrir `http://localhost:8089` para controlar la prueba.

### C) Script alternativo en Node.js
- Ejecutar en consola:
  ```bash
  node scripts/load_test.js
  ```

---

## 🐳 5. Consumidores en Java (Docker)

Para que las colas de RabbitMQ no se acumulen de forma indefinida, se requiere tener ejecutando el contenedor Docker del Backend en Java:

```bash
# Ejemplo de ejecución del contenedor consumidor
docker run -d --name smart-java-consumer \
  -e SPRING_RABBITMQ_HOST=shark.rmq.cloudamqp.com \
  -e SPRING_RABBITMQ_USERNAME=upzhvdpi \
  -e SPRING_RABBITMQ_PASSWORD=uQeQBUACo1mXOIuYq2Rta87dczLjEkHa \
  -e SPRING_RABBITMQ_VIRTUAL_HOST=upzhvdpi \
  smart-backend-java
```
