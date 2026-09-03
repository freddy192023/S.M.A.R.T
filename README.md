# 🚍 S.M.A.R.T — Smart Mobility & Administration Resource Technology

<div align="center">

![Version](https://img.shields.io/badge/versión-2.0.0-00d2c4?style=for-the-badge&labelColor=0a0e1a)
![Stack](https://img.shields.io/badge/React_19-TypeScript_6-3178c6?style=for-the-badge&labelColor=0a0e1a)
![Backend](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&labelColor=0a0e1a)
![Deploy](https://img.shields.io/badge/Vercel-Producción-000000?style=for-the-badge&labelColor=0a0e1a)
![License](https://img.shields.io/badge/Licencia-MIT-green?style=for-the-badge&labelColor=0a0e1a)

**Plataforma inteligente de gestión y reserva de transporte privado de pasajeros**

🌐 [Ver Demo en Vivo](https://s-m-a-r-t-six.vercel.app) · 📂 [Repositorio GitHub](https://github.com/freddy192023/S.M.A.R.T)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Problema que Resuelve](#-problema-que-resuelve)
- [Proceso Principal del Sistema](#-proceso-principal-del-sistema)
- [Tipos de Usuarios y Roles](#-tipos-de-usuarios-y-roles-rbac)
- [Módulos del Sistema](#-módulos-del-sistema)
- [Sistema de Asientos](#-sistema-de-asientos-nuevo)
- [Sistema de Reservas](#-sistema-de-reservas-nuevo)
- [Arquitectura del Software](#️-arquitectura-del-software)
- [Stack Tecnológico](#-stack-tecnológico)
- [Base de Datos](#️-base-de-datos)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos de Software](#-requisitos-de-software)
- [Cómo Ejecutar Localmente](#-cómo-ejecutar-localmente)
- [Hoja de Ruta](#-hoja-de-ruta--roadmap)
- [Información del Proyecto](#-información-del-proyecto)
- [Historial de Versiones](#-historial-de-versiones)

---

## 🧭 Descripción General

**S.M.A.R.T.** es una plataforma web destinada a la gestión integral de una empresa de transporte privado de pasajeros.

El sistema permite a la empresa administrar sus **buses, conductores, rutas, paraderos y viajes programados**, mientras que los pasajeros pueden consultar los viajes disponibles, seleccionar un asiento y realizar una reserva de forma digital para viajar en una fecha y horario determinados.

La plataforma centraliza toda la operación de la empresa y entrega al pasajero una experiencia completamente digital para consultar disponibilidad y reservar su viaje.

> 🚀 **S.M.A.R.T.** está diseñado bajo una arquitectura moderna de software, aplicando buenas prácticas de desarrollo web, modularización, tipado seguro con TypeScript y arquitectura cloud altamente escalable.

---

## 🎯 Problema que Resuelve

Las empresas de transporte privado enfrentan dificultades para administrar de manera centralizada sus vehículos, conductores, rutas y viajes. Un proceso basado en consultas presenciales, llamadas telefónicas o registros manuales dificulta conocer rápidamente:

- Qué viajes están disponibles y en qué horarios.
- Cuántos asientos quedan libres en cada bus.
- Qué bus y conductor realizará un viaje determinado.
- Qué pasajeros tienen una reserva confirmada.
- Cuál es la ocupación real de la flota.

### 💡 Solución propuesta

S.M.A.R.T. centraliza toda esta información en una única plataforma web accesible desde cualquier dispositivo.

| Problema                               | Solución S.M.A.R.T.                          |
| -------------------------------------- | -------------------------------------------- |
| Administración manual de buses         | Módulo de gestión de flota con CRUD completo |
| Información dispersa de conductores    | Registro centralizado de conductores         |
| Rutas desorganizadas                   | Gestión de rutas y paraderos                 |
| Programación manual de viajes          | Módulo de programación de viajes             |
| Dificultad para conocer disponibilidad | Sistema de disponibilidad de asientos        |
| Reservas realizadas manualmente        | Reserva digital con selección de asiento     |
| Falta de información operacional       | Dashboard adaptativo y reportes              |
| Acceso sin restricciones               | Sistema RBAC con 4 roles                     |
| Información dispersa                   | Base de datos PostgreSQL en la nube          |

---

## 📖 Manual de Flujo Operacional (Guía de Uso del Sistema)

Para que el sistema **S.M.A.R.T.** funcione de forma integrada y sin interrupciones, los Operadores y Administradores deben seguir la siguiente secuencia lógica de **6 pasos conectados**:

```
 ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
 │ 1. REGISTRAR   │ ───► │ 2. REGISTRAR   │ ───► │ 3. CREAR       │
 │    BUSES       │      │    CONDUCTORES │      │    RUTAS       │
 └────────────────┘      └────────────────┘      └────────────────┘
         │                                               │
         ▼                                               ▼
 ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
 │ 6. EJECUCIÓN   │ ◄─── │ 5. PROGRAMAR   │ ◄─── │ 4. ASIGNAR     │
 │    CONDUCTOR   │      │    EL VIAJE    │      │    PARADEROS   │
 └────────────────┘      └────────────────┘      └────────────────┘
```

### 🔹 Paso 1: Registrar Buses en Flota (`Módulo Buses`)
* **Acción:** Ingresar los vehículos disponibles en la empresa (Patente ej: `ABCD-12`, Marca `Mercedes-Benz`, Modelo `Sprinter`, Año `2024` y Capacidad `40 pasajeros`).
* **Finalidad:** Disponer de inventario de vehículos activos para asignar a los viajes.

### 🔹 Paso 2: Registrar Conductores Autorizados (`Módulo Conductores`)
* **Acción:** Dar de alta a los choferes autorizados (Nombre completo, N° Licencia, Vencimiento de Licencia, Teléfono y Bus asignado opcional).
* **Finalidad:** Tener personal capacitado y activo para conducir las unidades.

### 🔹 Paso 3: Crear Rutas y Trayectos (`Módulo Rutas`)
* **Acción:** Configurar los recorridos interurbanos o corporativos especificando Origen (`Santiago Central`), Destino (`Valparaíso`), Distancia en KM y Duración estimada en minutos.
* **Finalidad:** Definir los caminos principales que conectan los puntos de viaje.

### 🔹 Paso 4: Asignar Paraderos Intermedios (`Módulo Paraderos`)
* **Acción:** Si la ruta es extensa o requiere paradas intermedias de subida/bajada de pasajeros, registrar cada parada asignándola a su Ruta correspondiente y orden de secuencia (`Parada N° 1: Pajaritos`, `Parada N° 2: Quilicura`).
* **Finalidad:** Que tanto el conductor como el pasajero conozcan la secuencia exacta del recorrido.

### 🔹 Paso 5: Programar el Viaje (`Módulo Viajes` - Conexión Total)
* **Acción:** El operador une todos los componentes creados en los pasos previos en un solo registro:
  1. Selecciona la **Ruta**.
  2. Asigna un **Bus** disponible.
  3. Asigna un **Conductor** activo.
  4. Selecciona la **Fecha y Hora exacta de Salida**.
  5. Define el **Precio del Pasaje (S/)**.
* **Resultado:** El viaje queda publicado automáticamente para reserva y selección de asientos por los pasajeros.

### 🔹 Paso 6: Control del Conductor y Check-in (`Consola Conductor`)
* **Acción:** El chofer ingresa a su panel, presiona `▶ Iniciar Viaje`, consulta la secuencia de Paraderos y abre el `📋 Manifiesto de Pasajeros` para realizar el check-in (`✓ Marcar Abordado`) al subir cada pasajero al bus.

---

## 🔄 Proceso Principal del Sistema

El proceso más importante de S.M.A.R.T. es la **reserva de un viaje**, que demuestra que el sistema no es solo un CRUD, sino que tiene un flujo de negocio completo.

```
              EMPRESA DE TRANSPORTE
                      │
                      ▼
         Administra buses, conductores y rutas
                      │
                      ▼
              Programa viajes
                      │
                      ▼
          PUBLICA VIAJES DISPONIBLES
                      │
                      ▼
                  PASAJERO
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
  Inicia sesión           Busca origen/destino/fecha
          │                       │
          └───────────┬───────────┘
                      ▼
             Selecciona un viaje
                      │
                      ▼
           Consulta disponibilidad
                      │
                      ▼
             Selecciona asiento
                      │
                      ▼
             Revisa información
                      │
                      ▼
             Confirma reserva
                      │
                      ▼
              Pago simulado
                      │
                      ▼
           Reserva confirmada ✅
                      │
                      ▼
          Genera comprobante PDF
```

---

## 👥 Tipos de Usuarios y Roles (RBAC)

S.M.A.R.T. implementa un **Control de Acceso Basado en Roles** con 4 niveles jerárquicos. Los roles se asignan al momento del registro y determinan qué módulos y acciones están disponibles para cada usuario.

| Rol | Nivel | Acceso |
|---|---|---|
| **🔴 Administrador** | Total | Todos los módulos, usuarios, reportes y configuración |
| **🟠 Operador** | Gestión | Buses, conductores, rutas, viajes, paraderos, reservas |
| **🟡 Conductor** | Operativo | Viajes asignados, ruta, pasajeros del viaje, perfil |
| **🟢 Pasajero** | Reservas | Buscar viajes, seleccionar asiento, reservar, mis reservas |

### 🔴 Administrador

Responsable de la administración completa del sistema. Tiene acceso total a todos los módulos incluyendo gestión de usuarios, roles, reportes y configuración general del sistema.

### 🟠 Operador

Responsable de la operación diaria de la empresa. Registra y modifica buses, conductores, rutas y paraderos, programa viajes, asigna buses y conductores, y consulta reservas y reportes operacionales.

### 🟡 Conductor

Responsable de los viajes que tenga asignados. Puede ver su itinerario, consultar la ruta y los horarios, revisar la información del bus y consultar los pasajeros con reserva en cada viaje. También puede cambiar el estado de un viaje según corresponda.

### 🟢 Pasajero

Usuario final del sistema. Puede registrarse, iniciar sesión, buscar viajes por origen, destino y fecha, ver disponibilidad de asientos, seleccionar un asiento, realizar y cancelar reservas, y ver el detalle de sus viajes con el comprobante correspondiente.

### Implementación técnica:
- **Sidebar dinámico**: cada ítem del menú tiene un array `roles[]` que filtra la visibilidad.
- **Guardia de rutas en App.tsx**: un mapa `roleAccess` verifica el permiso antes de renderizar cada vista.
- **Dashboard adaptativo**: las tarjetas de estadísticas y accesos rápidos se adaptan según el rol.
- **Registro condicional**: al seleccionar "Conductor" aparecen campos adicionales (licencia, vencimiento, teléfono).

---

## 📦 Módulos del Sistema

### 🚌 Gestión de Buses

Módulo principal para administrar la flota de la empresa. Cada bus registra:

- Patente, marca, modelo y año
- Capacidad (número de asientos)
- Estado operativo

```
Estados: Disponible → En Mantención → Fuera de Servicio
```

> El sistema impide programar viajes con buses que estén fuera de servicio.

---

### 👨‍✈️ Gestión de Conductores

Registro centralizado de todos los conductores de la empresa:

- Nombre, correo, teléfono
- Número y fecha de vencimiento de licencia
- Estado actual

```
Estados: Activo → En Viaje → Inactivo
```

> Antes de asignar un conductor a un viaje se verifica que esté disponible.

---

### 🗺️ Gestión de Rutas y Paraderos

Las rutas representan los recorridos ofrecidos por la empresa. Cada ruta incluye:

- Origen y destino
- Distancia (km) y duración estimada
- Estado de la ruta

Además, cada ruta puede tener múltiples **paraderos** ordenados secuencialmente:

```
Origen
  │
  ▼
Paradero 1
  │
  ▼
Paradero 2
  │
  ▼
Destino
```

---

### 🚍 Programación de Viajes

Un **viaje** es una instancia concreta de una ruta en una fecha y horario determinados. El operador configura:

```
Ruta + Bus + Conductor + Fecha + Hora de salida + Precio → Viaje programado
```

Estados posibles:

```
Programado → En Curso → Finalizado
                      ↘ Cancelado
```

---

### 🔎 Búsqueda de Viajes (Pasajero)

El pasajero tiene una pantalla dedicada para buscar viajes disponibles:

- **Filtros**: Origen · Destino · Fecha
- **Resultados**: horario, precio, asientos disponibles y bus asignado

```
Lima → Huancayo — 15 Septiembre 2026

  08:00 ─────────── S/ 35.00
  Bus: ABC-123 · Asientos disponibles: 18
  [Seleccionar viaje →]
```

---

### 📊 Dashboard

El Dashboard es el panel central del sistema y se adapta según el rol:

**Administrador / Operador**
- Cantidad de buses, conductores activos, viajes programados y en curso
- Total de reservas, asientos ocupados y disponibles
- Porcentaje de utilización de la flota

**Pasajero**
- Próximos viajes con reserva activa
- Historial de viajes realizados
- Acceso rápido para buscar nuevos viajes

---

### 📈 Reportes

S.M.A.R.T. incorpora reportes operacionales para la empresa:

| Reporte | Descripción |
|---|---|
| **Viajes por ruta** | Frecuencia de viajes realizados por cada ruta |
| **Reservas por viaje** | Cantidad de reservas confirmadas por viaje |
| **Utilización de flota** | Porcentaje de ocupación por bus |
| **Ingresos estimados** | Basado en reservas confirmadas y precio del viaje |

---

## 💺 Sistema de Asientos (NUEVO)

Esta es una de las principales novedades de la versión 2.0. Cada bus tiene una distribución de asientos asociada a su capacidad.

```
┌───────────────────────┐
│       CONDUCTOR       │
├─────┬─────┬───┬───────┤
│ 01  │ 02  │   │ 03    │
├─────┼─────┼───┼───────┤
│ 04  │ 05  │   │ 06    │
├─────┼─────┼───┼───────┤
│ 07  │ 08  │   │ 09    │
├─────┼─────┼───┼───────┤
│ 10  │ 11  │   │ 12    │
└─────┴─────┴───┴───────┘
```

Cada asiento tiene un estado visual en tiempo real:

| Estado | Significado |
|---|---|
| 🟢 Disponible | El asiento puede ser seleccionado |
| 🔴 Reservado | El asiento ya tiene una reserva confirmada |
| ⚪ No disponible | El asiento está inhabilitado para ese viaje |

El pasajero puede visualizar la distribución completa del bus y seleccionar un asiento disponible antes de confirmar su reserva.

---

## 🎫 Sistema de Reservas (NUEVO)

El sistema de reservas es el **proceso central de S.M.A.R.T.**

### Flujo de reserva

```
1. Buscar viaje (origen, destino, fecha)
       ↓
2. Seleccionar viaje disponible
       ↓
3. Ver distribución de asientos
       ↓
4. Seleccionar asiento disponible
       ↓
5. Revisar resumen del viaje y precio
       ↓
6. Confirmar pago (simulado)
       ↓
7. Reserva generada y confirmada
       ↓
8. Visualizar comprobante
```

### Información de una reserva

| Campo | Descripción |
|---|---|
| Código de reserva | Identificador único (ej. SMART-000125) |
| Pasajero | Usuario que realizó la reserva |
| Viaje | Ruta, fecha y horario |
| Asiento | Número de asiento seleccionado |
| Precio | Precio del viaje al momento de reservar |
| Estado | Estado actual de la reserva |
| Fecha de reserva | Fecha y hora de la confirmación |

### Estados de una reserva

```
Pendiente → Confirmada → Completada
          ↘ Cancelada
```

### Comprobante de reserva

Una vez confirmada la reserva, el pasajero puede visualizar e imprimir su comprobante:

```
╔══════════════════════════════╗
║         S.M.A.R.T.           ║
║        COMPROBANTE           ║
╠══════════════════════════════╣
║ Reserva: SMART-000125        ║
║ Pasajero: Juan Pérez         ║
║                              ║
║ Origen:   Lima               ║
║ Destino:  Huancayo           ║
║ Fecha:    15/09/2026         ║
║ Hora:     08:00              ║
║ Bus:      ABC-123            ║
║ Asiento:  08                 ║
║ Precio:   S/ 35.00           ║
║                              ║
║ Estado:   CONFIRMADA ✅      ║
╚══════════════════════════════╝
```

### Pago simulado

Para el proyecto académico, el pago se maneja de forma simulada. El flujo muestra el resumen con el precio total y el botón "Confirmar pago", que aprueba automáticamente la transacción y confirma la reserva. Esto permite demostrar el proceso completo sin necesidad de integrar una pasarela de pago real.

---

## 🏗️ Arquitectura del Software

El proyecto sigue una **Arquitectura de Monolito Modular en el Frontend** con **capa de servicios desacoplada** que se comunica con Supabase como Backend-as-a-Service (BaaS).

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                         │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  Páginas     │  │  Componentes │  │  Contextos Globales     │ │
│  │  Públicas    │  │  Compartidos │  │  • AuthContext          │ │
│  │  • Home      │  │  • Header    │  │  • NotificationContext  │ │
│  │  • About     │  │  • Sidebar   │  │                         │ │
│  │  • Login     │  │  • Common    │  └─────────────────────────┘ │
│  └─────────────┘  └──────────────┘                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Módulos Administrativos (Privados)              │ │
│  │  Dashboard │ Buses │ Drivers │ Trips │ Routes │ Reports     │ │
│  │  Users │ Roles │ Stops │ Seats │ Reservations │ Profile     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌───────────────────────────▼─────────────────────────────────┐ │
│  │              Capa de Servicios (Service Layer)               │ │
│  │  busService │ driverService │ routeService │ tripService    │ │
│  │  stopService │ seatService │ reservationService │ profile   │ │
│  └─────────────────────────┬───────────────────────────────────┘ │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTPS (REST API)
┌────────────────────────────▼─────────────────────────────────────┐
│                    SUPABASE (Backend-as-a-Service)                │
│                                                                   │
│  ┌──────────────┐  ┌──────────────────────────────────────────┐  │
│  │  Auth (JWT)  │  │              PostgreSQL                   │  │
│  │  • Sign Up   │  │  profiles │ buses │ drivers │ routes     │  │
│  │  • Sign In   │  │  stops │ trips │ seats │ reservations    │  │
│  │  • Sessions  │  │  payments (opcional)                     │  │
│  └──────────────┘  └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                   VERCEL (Hosting & Serverless)                   │
│  • Static Site Hosting (SPA)                                     │
│  • Serverless Function: api/logger.js (Logs centralizados)       │
│  • Auto-deploy desde GitHub (branch main)                        │
└──────────────────────────────────────────────────────────────────┘
```

### Principios Arquitectónicos

| Principio | Implementación |
|---|---|
| **Componentización** | Cada módulo de negocio es un componente React aislado con responsabilidad única |
| **State-Driven Routing** | Navegación SPA basada en `window.location.hash`, sin dependencias externas de router |
| **Service Layer Pattern** | Cada tabla de la DB tiene un archivo de servicio dedicado que encapsula las operaciones CRUD |
| **Context API** | Estado global para autenticación y notificaciones sin librerías de state management |
| **Type Safety** | TypeScript con interfaces estrictas para el modelo de dominio |
| **Design System** | CSS modularizado en 3 capas: variables, estilos públicos y estilos del dashboard |

---

## 💻 Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | 19.2 | Librería de UI con componentes funcionales y Hooks |
| **TypeScript** | 6.0 | Tipado estático y seguridad en tiempo de compilación |
| **Vite** | 8.2 | Bundler ultrarrápido con HMR para desarrollo |
| **CSS Vanilla** | — | Sistema de diseño modular con variables CSS custom |

### Backend & Base de Datos
| Tecnología | Propósito |
|---|---|
| **Supabase** | Backend-as-a-Service: Auth, PostgreSQL, API REST auto-generada |
| **PostgreSQL** | Base de datos relacional en la nube |
| **Supabase Auth** | Autenticación con JWT, sesiones persistentes y recuperación de contraseña |

### DevOps & Infraestructura
| Tecnología | Propósito |
|---|---|
| **Vercel** | Hosting estático + Serverless Functions + Auto-deploy |
| **GitHub** | Control de versiones y trigger de despliegue automático |
| **OxLint** | Linter rápido para análisis estático de código |
| **Node.js** | Scripts de migración de base de datos (`scripts/migrate.js`) |

---

## 🗄️ Base de Datos

### Esquema Relacional (PostgreSQL en Supabase)

La versión 2.0 extiende el esquema existente con dos nuevas tablas principales: `seats` y `reservations`.

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│   profiles   │     │    drivers    │     │    buses     │
├──────────────┤     ├───────────────┤     ├──────────────┤
│ id (PK/FK)   │◄────│ user_id (FK)  │     │ id (PK)      │
│ full_name    │     │ name          │     │ plate        │
│ email        │     │ license_number│     │ brand        │
│ role         │     │ license_expiry│     │ model        │
│ avatar_url   │     │ phone         │     │ year         │
│ created_at   │     │ status        │     │ capacity     │
│ updated_at   │     │ created_at    │     │ status       │
└──────────────┘     └───────────────┘     │ created_at   │
                                           └──────┬───────┘
┌──────────────┐     ┌───────────────┐            │
│    routes    │     │    stops      │     ┌──────▼───────┐
├──────────────┤     ├───────────────┤     │    seats     │  ← NUEVO
│ id (PK)      │◄────│ route_id (FK) │     ├──────────────┤
│ name         │     │ name          │     │ id (PK)      │
│ origin       │     │ address       │     │ bus_id (FK)  │──► buses
│ destination  │     │ stop_order    │     │ seat_number  │
│ distance_km  │     │ created_at    │     │ status       │
│ duration_min │     └───────────────┘     └──────┬───────┘
│ status       │                                  │
│ created_at   │                                  │
└──────┬───────┘                                  │
       │                                          │
┌──────▼───────┐                        ┌─────────▼──────┐
│    trips     │                        │  reservations  │  ← NUEVO
├──────────────┤                        ├────────────────┤
│ id (PK)      │◄───────────────────────│ trip_id (FK)   │
│ route_id(FK) │──► routes              │ id (PK)        │
│ bus_id (FK)  │──► buses               │ passenger_id   │──► profiles
│ driver_id(FK)│──► drivers             │ seat_id (FK)   │──► seats
│ departure    │                        │ reservation_code│
│ arrival      │                        │ reservation_date│
│ price        │                        │ price          │
│ status       │                        │ status         │
│ created_at   │                        │ created_at     │
└──────────────┘                        └────────────────┘
```

### Nuevas tablas

**`seats`** — Asientos de cada bus:
```sql
id            UUID PRIMARY KEY
bus_id        UUID REFERENCES buses(id)
seat_number   INTEGER NOT NULL
status        TEXT DEFAULT 'available'
```

**`reservations`** — Reservas de pasajeros:
```sql
id                UUID PRIMARY KEY
passenger_id      UUID REFERENCES profiles(id)
trip_id           UUID REFERENCES trips(id)
seat_id           UUID REFERENCES seats(id)
reservation_code  TEXT UNIQUE NOT NULL
reservation_date  TIMESTAMPTZ DEFAULT NOW()
price             NUMERIC NOT NULL
status            TEXT DEFAULT 'pending'
```

**`payments`** (opcional):
```sql
id              UUID PRIMARY KEY
reservation_id  UUID REFERENCES reservations(id)
amount          NUMERIC NOT NULL
payment_method  TEXT
payment_status  TEXT
payment_date    TIMESTAMPTZ
```

### Automatizaciones de la DB:
- **Trigger `handle_new_user()`**: crea automáticamente un perfil en `profiles` al registrarse.
- **Trigger `update_updated_at()`**: actualiza el campo `updated_at` en cada modificación.
- **Función `generate_reservation_code()`**: genera el código único SMART-XXXXXX para cada reserva.
- **Datos semilla**: buses, conductores, rutas y viajes pre-cargados vía `scripts/migrate.js`.

---

## 📁 Estructura del Proyecto

```
S.M.A.R.T/
├── api/                          # Serverless Functions (Vercel)
│   └── logger.js                 # Endpoint de logs centralizados
│
├── scripts/                      # Scripts de automatización
│   └── migrate.js                # Migración de esquema DB + datos semilla
│
├── public/                       # Assets estáticos
│
├── src/
│   ├── main.tsx                  # Punto de entrada de la aplicación
│   ├── App.tsx                   # Router central, guards de autenticación y roles
│   ├── types.ts                  # Modelo de dominio TypeScript
│   │
│   ├── components/               # Componentes UI reutilizables
│   │   ├── Header.tsx            # Barra de navegación pública
│   │   ├── Sidebar.tsx           # Menú lateral del dashboard (filtrado por rol)
│   │   └── Common.tsx            # Componentes compartidos
│   │
│   ├── context/                  # Proveedores de estado global
│   │   ├── AuthContext.tsx        # Autenticación, sesiones y perfil de usuario
│   │   └── NotificationContext.tsx # Sistema de modales estilizados
│   │
│   ├── lib/                      # Configuraciones y utilidades
│   │   ├── supabaseClient.ts     # Cliente Supabase inicializado
│   │   └── vercelLogger.ts       # Helper para enviar logs a Vercel
│   │
│   ├── services/                 # Capa de acceso a datos (Service Layer)
│   │   ├── busService.ts         # CRUD de buses
│   │   ├── driverService.ts      # CRUD de conductores
│   │   ├── routeService.ts       # CRUD de rutas
│   │   ├── stopService.ts        # CRUD de paraderos
│   │   ├── tripService.ts        # CRUD de viajes (con JOINs)
│   │   ├── seatService.ts        # Gestión de asientos por bus/viaje ← NUEVO
│   │   ├── reservationService.ts # Gestión de reservas de pasajeros  ← NUEVO
│   │   └── profileService.ts     # Gestión de perfiles de usuario
│   │
│   ├── pages/                    # Páginas principales
│   │   ├── Home.tsx              # Landing page pública
│   │   ├── About.tsx             # Información del sistema
│   │   ├── HowItWorks.tsx        # Flujo explicativo
│   │   ├── Login.tsx             # Autenticación y registro con roles
│   │   ├── Dashboard.tsx         # Panel principal (adaptativo por rol)
│   │   ├── Profile.tsx           # Perfil del usuario actual
│   │   │
│   │   └── modules/              # Módulos del sistema
│   │       ├── Buses.tsx         # Gestión de flota
│   │       ├── Drivers.tsx       # Registro de conductores
│   │       ├── Routes.tsx        # Gestión de rutas
│   │       ├── Stops.tsx         # Paraderos y paradas
│   │       ├── Trips.tsx         # Programación de viajes
│   │       ├── TripSearch.tsx    # Búsqueda de viajes (pasajero)    ← NUEVO
│   │       ├── SeatSelector.tsx  # Selector visual de asientos       ← NUEVO
│   │       ├── Reservations.tsx  # Gestión y consulta de reservas    ← NUEVO
│   │       ├── MyReservations.tsx # Mis reservas (pasajero)          ← NUEVO
│   │       ├── Voucher.tsx       # Comprobante de reserva            ← NUEVO
│   │       ├── Reports.tsx       # Reportes y métricas
│   │       ├── Users.tsx         # Administración de usuarios
│   │       └── Roles.tsx         # Roles y permisos
│   │
│   └── styles/                   # Sistema de diseño CSS
│       ├── variables.css         # Paleta de colores, tipografías, tokens
│       ├── style.css             # Estilos del portal público y login
│       └── dashboard.css         # Estilos del panel administrativo
│
├── package.json                  # Dependencias y scripts
├── tsconfig.json                 # Configuración TypeScript
├── vite.config.ts                # Configuración Vite
└── README.md                     # Este archivo
```

---

## 📋 Requisitos de Software

El sistema cuenta con un total de **35 requisitos de software** (20 Requisitos Funcionales y 15 Requisitos No Funcionales) estructurados para ser claros, verificables y fáciles de validar mediante casos de prueba.

### 20 Requisitos Funcionales

| ID | Requisito Funcional |
|---|---|
| **RF-01** | El sistema deberá permitir a los usuarios **iniciar sesión** mediante correo electrónico y contraseña. |
| **RF-02** | El sistema deberá permitir a los usuarios **cerrar sesión**. |
| **RF-03** | El sistema deberá identificar el **rol del usuario** y mostrar las funcionalidades correspondientes. |
| **RF-04** | El sistema deberá permitir al administrador **registrar, consultar, actualizar y eliminar usuarios**. |
| **RF-05** | El sistema deberá permitir **registrar buses** con sus datos principales, como patente, marca, modelo, año y capacidad. |
| **RF-06** | El sistema deberá permitir **consultar y modificar los datos de los buses** registrados. |
| **RF-07** | El sistema deberá permitir **registrar y administrar conductores**, incluyendo sus datos y licencia. |
| **RF-08** | El sistema deberá permitir **registrar y administrar rutas**, indicando origen, destino, distancia y duración estimada. |
| **RF-09** | El sistema deberá permitir **registrar y administrar paraderos** asociados a una ruta. |
| **RF-10** | El sistema deberá permitir **crear y programar viajes**, indicando ruta, bus, conductor, fecha y hora. |
| **RF-11** | El sistema deberá permitir establecer y modificar el **precio de cada viaje**. |
| **RF-12** | El sistema deberá permitir al pasajero **buscar viajes por origen, destino y fecha**. |
| **RF-13** | El sistema deberá mostrar al pasajero los **viajes disponibles** según los criterios de búsqueda. |
| **RF-14** | El sistema deberá mostrar la **disponibilidad de asientos** de cada viaje. |
| **RF-15** | El sistema deberá permitir al pasajero **seleccionar un asiento disponible**. |
| **RF-16** | El sistema deberá impedir que un pasajero **reserve un asiento que ya se encuentre ocupado**. |
| **RF-17** | El sistema deberá permitir al pasajero **registrar y confirmar una reserva** asociada a un viaje y asiento. |
| **RF-18** | El sistema deberá generar un **código o comprobante único de reserva**. |
| **RF-19** | El sistema deberá permitir al pasajero **consultar y cancelar sus reservas**, según las condiciones establecidas. |
| **RF-20** | El sistema deberá generar **consultas y reportes de viajes, reservas y ocupación de buses**. |

---

### 15 Requisitos No Funcionales

| ID | Requisito No Funcional |
|---|---|
| **RNF-01** | El sistema deberá proteger las credenciales de los usuarios mediante un mecanismo de **autenticación segura**. |
| **RNF-02** | El sistema deberá implementar **control de acceso basado en roles (RBAC)** para restringir funcionalidades según el usuario. |
| **RNF-03** | Las claves y credenciales privadas del sistema **no deberán exponerse en el código del frontend**. |
| **RNF-04** | El sistema deberá mantener la **integridad de los datos** almacenados en la base de datos. |
| **RNF-05** | El sistema deberá impedir inconsistencias que permitan que un mismo asiento sea reservado simultáneamente para un mismo viaje. |
| **RNF-06** | El sistema deberá validar los datos ingresados en los formularios antes de almacenarlos. |
| **RNF-07** | El sistema deberá mostrar **mensajes de error claros y comprensibles** cuando ocurra una operación inválida. |
| **RNF-08** | La interfaz deberá ser **responsive**, permitiendo utilizar el sistema desde computadores, tablets y teléfonos. |
| **RNF-09** | La interfaz deberá mantener una **navegación consistente** entre los diferentes módulos. |
| **RNF-10** | Las operaciones habituales del sistema deberán presentar un **tiempo de respuesta adecuado** para el usuario. |
| **RNF-11** | El código deberá estar organizado de manera **modular y mantenible**, permitiendo agregar funcionalidades sin modificar toda la aplicación. |
| **RNF-12** | El sistema deberá utilizar **variables de entorno** para gestionar las configuraciones y credenciales de conexión. |
| **RNF-13** | La aplicación deberá ser compatible con **navegadores web modernos**. |
| **RNF-14** | Las funcionalidades principales deberán poder ser verificadas mediante **casos de prueba**. |
| **RNF-15** | El sistema deberá utilizar mecanismos de control de versiones para mantener un **registro de los cambios realizados al software**. |

### Resumen de Cobertura del Proyecto

| Requisito Solicitado | Implementación en S.M.A.R.T. |
|---|---|
| **20 Requisitos Funcionales** | ✅ RF-01 a RF-20 completos y documentados |
| **15 Requisitos No Funcionales** | ✅ RNF-01 a RNF-15 completos y documentados |
| **Login / Autenticación** | ✅ RF-01, RF-02, RNF-01, RNF-03 |
| **Menú Principal según Rol** | ✅ RF-03, RNF-02 |
| **CRUDs Completos** | ✅ RF-04 (Usuarios), RF-05/06 (Buses), RF-07 (Conductores), RF-08 (Rutas), RF-09 (Paraderos) |
| **Proceso Principal** | ✅ Búsqueda (RF-12/13) → Asientos (RF-14/15/16) → Reserva (RF-17) → Comprobante (RF-18) |
| **Reporte / Consulta** | ✅ RF-20 (Consultas y reportes de viajes, reservas y ocupación de buses) |

---

## 🚀 Despliegue y CI/CD

```
Developer Push ──► GitHub (main) ──► Vercel Auto-Deploy ──► Producción
                                          │
                                          ├── Build: tsc + vite build
                                          ├── Serverless: api/logger.js
                                          └── URL: s-m-a-r-t-six.vercel.app
```

| Componente | Detalle |
|---|---|
| **Hosting** | Vercel (Plan Hobby) |
| **Deploy automático** | Cada `git push` a `main` dispara un build en Vercel |
| **Serverless Functions** | `api/logger.js` — endpoint para centralizar logs del cliente |
| **URL de producción** | [s-m-a-r-t-six.vercel.app](https://s-m-a-r-t-six.vercel.app) |
| **Base de datos** | Supabase PostgreSQL en la nube |

---

## 💻 Cómo Ejecutar Localmente

### Prerrequisitos
- **Node.js** v18 o superior
- **npm** v9 o superior
- **Git**

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/freddy192023/S.M.A.R.T.git
cd S.M.A.R.T

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear archivo .env.local con las credenciales de Supabase:
# VITE_SUPABASE_URL=tu_url_de_supabase
# VITE_SUPABASE_ANON_KEY=tu_anon_key

# 4. Ejecutar migraciones (opcional, para inicializar la DB)
node scripts/migrate.js

# 5. Iniciar servidor de desarrollo
npm run dev

# 6. Abrir en el navegador
# http://localhost:5173
```

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR (Hot Module Replacement) |
| `npm run build` | Compilación TypeScript + build de producción |
| `npm run preview` | Previsualización del build de producción |
| `npm run lint` | Análisis estático con OxLint |
| `node scripts/migrate.js` | Ejecutar migraciones de base de datos |

---

## 🗺️ Hoja de Ruta — Roadmap

### 📌 v2.0.0 — Sistema de Reservas (En desarrollo)
- [ ] **Tabla `seats`** con distribución de asientos por bus
- [ ] **Tabla `reservations`** con código único y estados
- [ ] **Selector visual de asientos** con disponibilidad en tiempo real
- [ ] **Flujo de búsqueda y reserva** completo para el pasajero
- [ ] **Pago simulado** con confirmación automática
- [ ] **Comprobante de reserva** visualizable e imprimible
- [ ] **Módulo "Mis Reservas"** para el pasajero
- [ ] **Vista de pasajeros por viaje** para el conductor
- [ ] **Reportes ampliados** con ocupación y reservas

### 📌 v2.1.0 — Mejoras de UX
- [ ] **Filtros avanzados** en tablas (por estado, fecha, ruta)
- [ ] **Paginación** en listados con muchos registros
- [ ] **Edición de perfil** con carga de avatar
- [ ] **Modo claro/oscuro** con toggle

### 📌 v2.2.0 — Calidad de Software y Testing
- [ ] **Pruebas unitarias** con Vitest + React Testing Library
- [ ] **Pruebas de integración** para flujos de autenticación y reservas
- [ ] **Pruebas E2E** con Playwright para el flujo completo de reserva
- [ ] **Pipeline CI/CD** con GitHub Actions (lint + test + build en cada PR)

### 📌 v3.0.0 — Plataforma Completa
- [ ] **Pasarela de pago real** (Stripe, Mercado Pago o similar)
- [ ] **Notificaciones por correo** al confirmar o cancelar una reserva
- [ ] **Row Level Security (RLS)** activada en Supabase
- [ ] **Exportación de reportes** a PDF y Excel
- [ ] **Aplicación móvil** (React Native) para conductores y pasajeros

---

## ℹ️ Información del Proyecto

| Campo | Detalle |
|---|---|
| **Plataforma** | Sistema Web para Gestión de Transporte Privado |
| **Versión** | 2.0.0 |
| **Arquitectura** | Frontend SPA (React 19) + Cloud Backend (Supabase PostgreSQL) |
| **Tipo de despliegue** | CI/CD Automático en Vercel |
| **Metodología** | Desarrollo Ágil e Incremental |

### Capacidades del sistema:
- ✅ Desarrollo web moderno con React + TypeScript
- ✅ Arquitectura de software basada en componentes y capa de servicios
- ✅ Integración con servicios cloud (Supabase, Vercel)
- ✅ Control de versiones con Git y GitHub
- ✅ Despliegue continuo automatizado (CI/CD)
- ✅ Diseño de base de datos relacional PostgreSQL
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Modelado de procesos de negocio (reserva de viajes)
- ✅ Diseño UX/UI con sistema de diseño moderno

---

## 📦 Historial de Versiones

### v2.0.0 (En desarrollo)
- 🔄 Nuevo modelo de negocio: transporte privado de pasajeros con reserva de asientos
- 🔄 Nuevas tablas: `seats` y `reservations`
- 🔄 Módulo de búsqueda de viajes para el pasajero
- 🔄 Selector visual de asientos con disponibilidad en tiempo real
- 🔄 Flujo completo de reserva: búsqueda → asiento → pago simulado → comprobante
- 🔄 Reportes ampliados con ocupación y estadísticas de reservas

### v1.1.0
- ✅ Registro de cuentas con selección de rol y campos dinámicos para conductor
- ✅ Control de acceso por rol en Dashboard, Sidebar y guards de navegación
- ✅ Migración completa de alertas nativas a modales estilizados (NotificationContext)
- ✅ Serverless Function para logs centralizados en Vercel

### v1.0.0
- ✅ Integración completa con Supabase (Auth + PostgreSQL)
- ✅ Capa de servicios para todas las tablas (busService, driverService, etc.)
- ✅ Migración de datos mock a datos reales de la base de datos
- ✅ Script de migraciones con triggers, funciones y datos semilla
- ✅ Dashboard con métricas en tiempo real
- ✅ Reportes de utilización de flota

### v0.1.0
- ✅ Estructura base del proyecto con React + TypeScript + Vite
- ✅ Portal público con landing page y sección de rutas
- ✅ Panel administrativo con todos los módulos de UI
- ✅ Sistema de diseño Cyberpunk/Glassmorphism

---

<div align="center">

**S.M.A.R.T** — Smart Mobility & Administration Resource Technology

Desarrollado con 💚 por el equipo de S.M.A.R.T · 2026

</div>
