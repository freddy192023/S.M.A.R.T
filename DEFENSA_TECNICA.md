# 📘 Manual de Defensa Técnica y Arquitectura de S.M.A.R.T.

---

## 📋 Resumen Ejecutivo

Este documento contiene la **auditoría técnica detallada**, la **ubicación exacta en código de cada componente de seguridad/arquitectura** y la **fundamentación técnica** de la arquitectura Serverless / BaaS adoptada por el proyecto **S.M.A.R.T.** (Smart Mobility & Administration Resource Technology).

---

## 🟢 1. Auditoría de Componentes Implementados (Frontend & Cliente)

| # | Aspecto / Requisito | Estado | Ubicación en Código | Explicación Técnica y Funcionamiento |
|---|---------------------|--------|---------------------|--------------------------------------|
| **1** | **Login con Usuario y Contraseña** | ✅ Implementado | [`src/pages/Login.tsx`](src/pages/Login.tsx#L35-L55) | Formulario que autentica contra el servidor de identidades mediante `supabase.auth.signInWithPassword({ email, password })`. |
| **2** | **Obtención y Gestión de JWT** | ✅ Implementado | [`src/context/AuthContext.tsx`](src/context/AuthContext.tsx#L49-L72) | Contexto global de React (`AuthProvider`) que escucha cambios de estado con `onAuthStateChange()` y mantiene la sesión JWT activa. |
| **3** | **Persistencia de Tokens** | ✅ Implementado | [`src/lib/supabaseClient.ts`](src/lib/supabaseClient.ts#L1-L15) | El SDK de Supabase persiste automáticamente los tokens (`access_token` y `refresh_token`) en el `localStorage` del navegador. |
| **4** | **Cierre de Sesión (Destrucción de Token)** | ✅ Implementado | [`src/context/AuthContext.tsx`](src/context/AuthContext.tsx#L75-L85) | La función `signOut()` invoca `supabase.auth.signOut()`, invalidando el token en el servidor y limpiando el almacenamiento local. |
| **5** | **Guard de Ruta Privada (Auth Guard)** | ✅ Implementado | [`src/App.tsx`](src/App.tsx#L62-L72) | Control en React que evalúa la vista solicitada. Si la ruta no es pública y el usuario es nulo, lo redirige forzosamente a `#login`. |
| **6** | **Control de Acceso por Rol (RBAC)** | ✅ Implementado | [`src/App.tsx`](src/App.tsx#L74-L105) y [`src/components/Sidebar.tsx`](src/components/Sidebar.tsx#L25-L65) | Mapeo de vistas permitidas por rol (`admin`, `operator`, `driver`, `passenger`). Muestra solo opciones autorizadas en la UI y restringe accesos directos por URL. |
| **7** | **Inyección de Token Bearer en API** | ✅ Implementado | [`src/lib/supabaseClient.ts`](src/lib/supabaseClient.ts#L1-L15) | Cada petición HTTP enviada mediante la librería cliente adjunta en la cabecera `Authorization: Bearer <JWT_TOKEN>`. |
| **8** | **Capa de Servicios Modulares** | ✅ Implementado | Carpeta [`src/services/`](src/services/) | Desacoplamiento de la UI mediante servicios dedicados: `busService.ts`, `driverService.ts`, `routeService.ts`, `tripService.ts`, `reservationService.ts`. |

---

## 🟡 2. Defensa Técnica de la Arquitectura Serverless (BaaS vs. Monolito Tradicional)

En las evaluaciones tradicionales suele preguntarse por componentes como **API Gateway en Java (Spring Cloud Gateway)**, **Filtros JWT (`OncePerRequestFilter`)** y **Anotaciones Backend (`@PreAuthorize`)**. A continuación se presenta la justificación de por qué la arquitectura moderna de S.M.A.R.T. reemplaza estos patrones manteniendo o superando sus estándares de seguridad:

### 1. API Gateway Nativo (PostgREST Engine)
* **Pregunta de evaluación:** ¿Por qué no existe un servidor dedicado de API Gateway (ej. Spring Cloud Gateway / Express Gateway)?
* **Defensa Técnica:** 
  > En la arquitectura **BaaS (Backend as a Service)** de S.M.A.R.T., el motor **Supabase PostgREST** actúa nativamente como API Gateway. PostgREST recibe todas las peticiones HTTPS desde el frontend React, realiza la resolución de URLs/endpoints de manera dinámica, gestiona los encabezados CORS y valida la firma y vigencia del JWT en el punto de entrada antes de encaminar cualquier transacción a la capa de datos.

### 2. Validación JWT en el Backend
* **Pregunta de evaluación:** ¿Dónde se valida la firma, expiración (`exp`), audiencia (`aud`) y emisor (`iss`) en el backend?
* **Defensa Técnica:**
  > La validación se ejecuta en el backend a nivel del kernel de datos:
  > 1. **Firma y Expiración:** PostgREST desencripta la firma HMAC-SHA256 utilizando la clave secreta `JWT_SECRET` y valida automáticamente la marca de tiempo `exp`. Si el token expiró, la petición es rechazada de inmediato con `HTTP 401 Unauthorized`.
  > 2. **Issuer y Audience:** Son verificados por el microservicio de autenticación GoTrue.
  > 3. **Contexto de Sesión:** El parámetro `sub` (ID de usuario) se extrae del JWT y se expone como variable de sesión segura `auth.uid()`.

### 3. Autorización por Rol en el Backend (RLS vs. `@PreAuthorize`)
* **Pregunta de evaluación:** ¿Por qué no existen anotaciones `@PreAuthorize("hasRole('ADMIN')")` en controladores backend?
* **Defensa Técnica:**
  > En lugar de depender de anotaciones en una capa de aplicación (como Spring Security), S.M.A.R.T. implementa **Row Level Security (RLS) en PostgreSQL**. La autorización por rol se ejecuta directamente en el motor de base de datos a nivel de tabla/fila (Zero-Trust Data Access):
  >
  > ```sql
  > -- Ejemplo de Política RLS en PostgreSQL (Equivalente Backend a @PreAuthorize):
  > CREATE POLICY "Solo Administradores pueden insertar Buses"
  > ON public.buses FOR INSERT
  > WITH CHECK (
  >   (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  > );
  > ```
  > Esto garantiza que incluso si un atacante intentara eludir el frontend, la base de datos rechazará cualquier consulta no autorizada a nivel de backend.

---

## 📊 3. Matriz Comparativa para la Evaluación

| Requisito Académico Tradicional | Implementación en S.M.A.R.T. | Beneficio de Seguridad / Rendimiento |
|---------------------------------|------------------------------|--------------------------------------|
| **API Gateway Independiente** | **PostgREST Native Gateway** | Reducción de latencia y eliminación de puntos de falla intermedios. |
| **Backend Monolítico (Spring/Express)** | **PostgREST + Supabase Cloud** | Escalabilidad automática Serverless y mantenimiento simplificado. |
| **Filtro JWT (`OncePerRequestFilter`)** | **PostgREST JWT HMAC Verifier** | Verificación nativa antes de evaluar cualquier consulta SQL. |
| **Autorización `@PreAuthorize`** | **PostgreSQL Row Level Security (RLS)** | Protección Zero-Trust a nivel de fila directamente en el motor de BD. |
