# 🚍 S.M.A.R.T — Smart Mobility & Administration Resource Technology

<div align="center">

![Version](https://img.shields.io/badge/versión-1.1.0-00d2c4?style=for-the-badge&labelColor=0a0e1a)
![Stack](https://img.shields.io/badge/React_19-TypeScript_6-3178c6?style=for-the-badge&labelColor=0a0e1a)
![Backend](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&labelColor=0a0e1a)
![Deploy](https://img.shields.io/badge/Vercel-Producción-000000?style=for-the-badge&labelColor=0a0e1a)
![License](https://img.shields.io/badge/Licencia-Académica-ff6b6b?style=for-the-badge&labelColor=0a0e1a)

**Plataforma inteligente de gestión y control de transporte corporativo en tiempo real**

🌐 [Ver Demo en Vivo](https://s-m-a-r-t-six.vercel.app) · 📂 [Repositorio GitHub](https://github.com/freddy192023/S.M.A.R.T)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Problema que Resuelve](#-problema-que-resuelve)
- [Características Actuales](#-características-actuales-v110)
- [Arquitectura del Software](#️-arquitectura-del-software)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Sistema de Roles y Permisos](#-sistema-de-roles-y-permisos-rbac)
- [Base de Datos](#️-base-de-datos)
- [Despliegue y CI/CD](#-despliegue-y-cicd)
- [Cómo Ejecutar Localmente](#-cómo-ejecutar-localmente)
- [Hoja de Ruta](#-hoja-de-ruta--roadmap)
- [Visión a Largo Plazo](#-visión-a-largo-plazo)
- [Equipo y Contexto Académico](#-equipo-y-contexto-académico)
- [Historial de Versiones](#-historial-de-versiones)

---

## 🧭 Descripción General

**S.M.A.R.T** es una plataforma web integral diseñada para optimizar la logística, control y administración del transporte empresarial. Permite a las organizaciones gestionar su flota de vehículos, asignar conductores, planificar rutas, programar viajes y monitorear operaciones en tiempo real desde un panel centralizado.

El sistema está construido con una filosofía **Mobile-First** y un diseño visual **Cyberpunk/Glassmorphism** que prioriza la experiencia de usuario con interfaces modernas, animaciones fluidas y una paleta tecnológica de tonos Teal y Slate Blue.

> 🎓 Este proyecto fue desarrollado como prototipo funcional para la asignatura de **Técnicas de Calidad de Software**, aplicando buenas prácticas de desarrollo web, modularización, tipado seguro y arquitectura escalable.

---

## 🎯 Problema que Resuelve

Las empresas de transporte corporativo enfrentan desafíos críticos en su operación diaria:

| Problema | Solución S.M.A.R.T |
|---|---|
| **Asignación manual** de buses y conductores | Panel inteligente con asignación centralizada y validación de disponibilidad |
| **Falta de visibilidad** del estado operativo | Dashboard en tiempo real con métricas, KPIs y viajes en curso |
| **Control de acceso inexistente** | Sistema RBAC con 4 niveles de roles (Admin, Operador, Conductor, Pasajero) |
| **Rutas desorganizadas** | Módulo de rutas con origen, destino, distancia, duración y paraderos intermedios |
| **Reportes manuales** | Generación automática de métricas de utilización de flota y frecuencia de viajes |
| **Datos dispersos** en hojas de cálculo | Base de datos relacional PostgreSQL en la nube con Supabase |

---

## ✅ Características Actuales (v1.1.0)

### 🌐 Portal Público (Sin autenticación)
- **Landing Page** con diseño premium y animaciones glassmorphic
- **Sección "Acerca de"** con información institucional
- **¿Cómo Funciona?** — Explicación visual del flujo del sistema
- **Consulta de Rutas Públicas** — Búsqueda en tiempo real de rutas activas desde la base de datos

### 🔐 Sistema de Autenticación
- Registro de cuentas con **selección de rol** (Pasajero, Conductor, Operador, Admin)
- Campos dinámicos condicionales: al seleccionar "Conductor" se solicitan Licencia, Vencimiento y Teléfono
- Login seguro con **Supabase Auth** (email + contraseña)
- Sesiones persistentes con tokens JWT automáticos
- Recuperación de contraseña integrada

### 📊 Dashboard Administrativo
- **Tarjetas de estadísticas** en tiempo real (buses activos, conductores, rutas, viajes)
- **Viajes en curso** monitoreados en tabla operacional
- **Enlaces rápidos** filtrados según el rol del usuario
- Contenido adaptativo: los pasajeros ven un dashboard simplificado

### 🚌 Gestión de Flota de Buses
- CRUD completo: crear, editar y listar buses
- Control de patentes, marcas, modelos, año y capacidad
- Estados operativos: `Disponible`, `En Mantención`, `Fuera de Servicio`
- Datos persistidos en PostgreSQL vía Supabase

### 👨‍✈️ Registro de Conductores
- Administración de choferes con licencia, vencimiento y teléfono
- Estados: `Activo`, `En Viaje`, `Inactivo`
- Vinculación automática con el perfil de usuario al registrarse como conductor

### 🗺️ Control de Rutas
- Registro de rutas con origen, destino, distancia (km) y duración estimada
- Estados: `Activa`, `Inactiva`, `En Mantención`
- Consulta pública de rutas para pasajeros

### 📍 Paraderos y Paradas
- Gestión de paraderos intermedios vinculados a rutas
- Orden secuencial de paradas dentro de cada ruta

### 🚍 Programación de Viajes
- Asignación de bus + conductor + ruta para crear viajes
- Estados de viaje: `Programado`, `En Curso`, `Finalizado`, `Cancelado`
- Registro de horarios de salida y llegada

### 📈 Reportes y Métricas
- Gráfico de barras de **frecuencia de viajes semanales**
- Tabla de **utilización de flota** (viajes realizados, horas de operación, % de uso)
- Cálculos automáticos basados en datos reales de la base de datos

### 👥 Gestión de Usuarios
- Listado completo de usuarios registrados con rol, email y estado
- Visualización de perfiles con datos de Supabase Auth

### 🔔 Sistema de Notificaciones
- **Modales estilizados** con diseño glassmorphic premium (reemplazo total de `alert()` nativos)
- Tipos de notificación: `success`, `error`, `warning`, `info`
- Animaciones de entrada/salida suaves con backdrop blur
- Contexto global (`NotificationContext`) accesible desde cualquier componente

### 🛡️ Control de Acceso por Rol
- Sidebar dinámico que muestra solo los módulos permitidos por rol
- Guardia de rutas: redirección automática si se intenta acceder a una vista restringida
- Dashboard con contenido adaptativo según el nivel de permisos

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
│  │  • Routes    │  │  • Common    │  └─────────────────────────┘ │
│  │  • Login     │  └──────────────┘                              │
│  └─────────────┘                                                 │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Módulos Administrativos (Privados)              │ │
│  │  Dashboard │ Buses │ Drivers │ Trips │ Routes │ Reports     │ │
│  │  Users │ Roles │ Stops │ Profile                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌───────────────────────────▼─────────────────────────────────┐ │
│  │              Capa de Servicios (Service Layer)               │ │
│  │  busService │ driverService │ routeService │ tripService    │ │
│  │  stopService │ profileService                               │ │
│  └─────────────────────────┬───────────────────────────────────┘ │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTPS (REST API)
┌────────────────────────────▼─────────────────────────────────────┐
│                     SUPABASE (Backend-as-a-Service)               │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │  Auth (JWT)  │  │  PostgreSQL  │  │  Triggers & Functions  │  │
│  │  • Sign Up   │  │  • profiles  │  │  • handle_new_user()   │  │
│  │  • Sign In   │  │  • buses     │  │  • update_updated_at() │  │
│  │  • Sessions  │  │  • drivers   │  │  • audit_changes()     │  │
│  └──────────────┘  │  • routes    │  └────────────────────────┘  │
│                    │  • stops     │                               │
│                    │  • trips     │                               │
│                    └──────────────┘                               │
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
| **PostgreSQL** | Base de datos relacional en la nube (AWS us-west-2) |
| **Supabase Auth** | Autenticación con JWT, sesiones persistentes y recuperación de contraseña |

### DevOps & Infraestructura
| Tecnología | Propósito |
|---|---|
| **Vercel** | Hosting estático + Serverless Functions + Auto-deploy |
| **GitHub** | Control de versiones y trigger de despliegue automático |
| **OxLint** | Linter rápido para análisis estático de código |
| **Node.js** | Scripts de migración de base de datos (`scripts/migrate.js`) |

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
│   ├── mockData.ts               # Datos de respaldo (legacy)
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
│   │   └── profileService.ts     # Gestión de perfiles de usuario
│   │
│   ├── pages/                    # Páginas principales
│   │   ├── Home.tsx              # Landing page pública
│   │   ├── About.tsx             # Información del sistema
│   │   ├── HowItWorks.tsx        # Flujo explicativo
│   │   ├── RoutesPage.tsx        # Consulta pública de rutas
│   │   ├── Login.tsx             # Autenticación y registro con roles
│   │   ├── Dashboard.tsx         # Panel principal (adaptativo por rol)
│   │   ├── Profile.tsx           # Perfil del usuario actual
│   │   │
│   │   └── modules/              # Módulos administrativos privados
│   │       ├── Buses.tsx         # Gestión de flota
│   │       ├── Drivers.tsx       # Registro de conductores
│   │       ├── Trips.tsx         # Programación de viajes
│   │       ├── Reports.tsx       # Reportes y métricas
│   │       ├── Users.tsx         # Administración de usuarios
│   │       ├── Roles.tsx         # Roles y permisos
│   │       └── Stops.tsx         # Paraderos y paradas
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

## 🔐 Sistema de Roles y Permisos (RBAC)

S.M.A.R.T implementa un **Control de Acceso Basado en Roles** (Role-Based Access Control) con 4 niveles jerárquicos:

| Rol | Nivel | Acceso |
|---|---|---|
| **🔴 Administrador** | Total | Todos los módulos, gestión de usuarios, reportes, configuración |
| **🟠 Operador** | Gestión | Buses, conductores, rutas, viajes, reportes, paraderos |
| **🟡 Conductor** | Operativo | Dashboard, rutas, viajes asignados, paraderos, perfil |
| **🟢 Pasajero** | Consulta | Dashboard simplificado, consulta de rutas, viajes, perfil |

### Implementación técnica:
- **Sidebar dinámico**: cada item del menú tiene un array `roles[]` que filtra la visibilidad
- **Guardia de rutas en App.tsx**: un mapa `roleAccess` verifica el permiso antes de renderizar cada vista
- **Dashboard adaptativo**: las tarjetas de stats, enlaces rápidos y columnas de tabla se muestran/ocultan según el rol
- **Registro condicional**: al seleccionar "Conductor" en el formulario de registro, aparecen campos adicionales obligatorios (licencia, vencimiento, teléfono)

---

## 🗄️ Base de Datos

### Esquema Relacional (PostgreSQL en Supabase)

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
                                           └──────────────┘
┌──────────────┐     ┌───────────────┐
│    routes    │     │    stops      │
├──────────────┤     ├───────────────┤
│ id (PK)      │◄────│ route_id (FK) │
│ name         │     │ name          │
│ origin       │     │ address       │
│ destination  │     │ stop_order    │
│ distance_km  │     │ latitude      │
│ duration_min │     │ longitude     │
│ status       │     │ created_at    │
│ created_at   │     └───────────────┘
└──────┬───────┘
       │
┌──────▼───────┐
│    trips     │
├──────────────┤
│ id (PK)      │
│ route_id(FK) │──► routes
│ bus_id (FK)  │──► buses
│ driver_id(FK)│──► drivers
│ departure    │
│ arrival      │
│ status       │
│ created_at   │
└──────────────┘
```

### Automatizaciones de la DB:
- **Trigger `handle_new_user()`**: crea automáticamente un perfil en `profiles` cuando un usuario se registra en Supabase Auth
- **Trigger `update_updated_at()`**: actualiza el campo `updated_at` en cada modificación
- **Función `audit_changes()`**: registra cambios para trazabilidad
- **Datos semilla**: buses, conductores y rutas pre-cargados vía `scripts/migrate.js`

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
| **Base de datos** | Supabase PostgreSQL (AWS us-west-2) |

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

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Abrir en el navegador
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

### 📌 v1.2.0 — Mejoras de UX y Funcionalidad (Próximo)
- [ ] **CRUD completo de paraderos** con mapa interactivo (geolocalización)
- [ ] **Edición de perfil** con carga de avatar
- [ ] **Filtros avanzados** en tablas (por estado, fecha, ruta)
- [ ] **Paginación** en listados con muchos registros
- [ ] **Modo claro/oscuro** con toggle
- [ ] **Notificaciones push** para cambios de estado en viajes

### 📌 v1.3.0 — Tiempo Real y Tracking
- [ ] **Seguimiento GPS en vivo** de buses en ruta (Supabase Realtime)
- [ ] **Mapa interactivo** con recorridos de rutas y posición de buses
- [ ] **ETA (Estimated Time of Arrival)** para paraderos
- [ ] **Alertas automáticas** cuando un bus se desvía de la ruta o se retrasa
- [ ] **Panel de conductor** con vista móvil dedicada para iniciar/finalizar viajes

### 📌 v1.4.0 — Calidad de Software y Testing
- [ ] **Pruebas unitarias** con Vitest + React Testing Library
- [ ] **Pruebas de integración** para flujos de autenticación y RBAC
- [ ] **Pruebas E2E** con Playwright para flujos críticos
- [ ] **Pipeline CI/CD** con GitHub Actions (lint + test + build en cada PR)
- [ ] **Cobertura de código** mínima del 80%
- [ ] **SonarQube** para análisis de deuda técnica

### 📌 v2.0.0 — Plataforma Empresarial
- [ ] **API REST propia** (Node.js/Express o .NET) para lógica de negocio compleja
- [ ] **Row Level Security (RLS)** activada en Supabase para seguridad a nivel de fila
- [ ] **Multi-tenancy**: soporte para múltiples empresas de transporte
- [ ] **Sistema de turnos** para conductores con calendario
- [ ] **Facturación y costos** operacionales por ruta/viaje
- [ ] **Exportación** de reportes a PDF y Excel
- [ ] **Aplicación móvil nativa** (React Native) para conductores y pasajeros

---

## 🌟 Visión a Largo Plazo

### ¿A dónde queremos llegar?

S.M.A.R.T aspira a convertirse en una **plataforma SaaS (Software as a Service)** completa para la gestión inteligente de transporte corporativo, capaz de:

1. **🏢 Servir a múltiples empresas** — Cada organización con su propia instancia configurada, con branding personalizado y gestión independiente de flota.

2. **📱 Experiencia multiplataforma** — Panel web para administradores y operadores, aplicación móvil nativa para conductores (iniciar viajes, reportar incidencias) y pasajeros (consultar horarios, ver ETA en tiempo real).

3. **🤖 Inteligencia artificial operativa** — Algoritmos de optimización para:
   - Asignación automática del mejor bus/conductor según disponibilidad, distancia y carga
   - Predicción de demanda por ruta y horario
   - Detección de anomalías (retrasos, desvíos, sobreuso de vehículos)

4. **📊 Business Intelligence** — Dashboards avanzados con:
   - Análisis de costos operativos por kilómetro
   - Índice de puntualidad por conductor y ruta
   - Proyecciones de mantención preventiva de flota
   - Reportes automáticos para gerencia

5. **🔗 Integraciones empresariales** — Conexión con sistemas de:
   - ERP corporativos
   - Sistemas de nómina (para horas trabajadas de conductores)
   - APIs de tráfico y clima para ajustar rutas dinámicamente
   - Plataformas de pago para pasajes electrónicos

### Nuestra meta final:
> Transformar S.M.A.R.T de un proyecto académico a una herramienta de gestión de transporte con impacto real, donde cada kilómetro recorrido esté optimizado, cada conductor asignado de forma inteligente y cada pasajero informado en tiempo real.

---

## 🎓 Equipo y Contexto Académico

| Campo | Detalle |
|---|---|
| **Asignatura** | Técnicas de Calidad de Software |
| **Institución** | Universidad |
| **Año** | 2026 |
| **Tipo de proyecto** | Prototipo funcional con base de datos real |
| **Metodología** | Desarrollo iterativo con entregas incrementales |

### Competencias aplicadas:
- ✅ Desarrollo web moderno con React + TypeScript
- ✅ Arquitectura de software basada en componentes
- ✅ Integración con servicios cloud (Supabase, Vercel)
- ✅ Control de versiones con Git y GitHub
- ✅ Despliegue continuo automatizado
- ✅ Diseño de base de datos relacional
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Diseño UX/UI con sistema de diseño coherente

---

## 📦 Historial de Versiones

### v1.1.0 (Actual)
- ✅ Registro de cuentas con selección de rol y campos dinámicos para conductor
- ✅ Control de acceso por rol en Dashboard, Sidebar y guards de navegación
- ✅ Migración completa de alertas nativas a modales estilizados (NotificationContext)
- ✅ Estilo premium para selects dropdown
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
- ✅ Portal público con landing page, about y rutas
- ✅ Panel administrativo con todos los módulos de UI
- ✅ Datos mock para prototipado visual
- ✅ Sistema de diseño Cyberpunk/Glassmorphism

---

<div align="center">

**S.M.A.R.T** — Smart Mobility & Administration Resource Technology

Hecho con 💚 para la asignatura de Técnicas de Calidad de Software · 2026

</div>
