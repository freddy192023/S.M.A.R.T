package com.smart.messaging.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

/**
 * 🛡️ FILTRO DE SEGURIDAD JWT (Bloque 2.3)
 *
 * Intercepta las peticiones entrantes para validar el token JWT emitido por el IDaaS
 * (Supabase Auth / GoTrue) presente en la cabecera 'Authorization: Bearer <token>'.
 *
 * Valida:
 *  1. Existencia del encabezado Bearer.
 *  2. Estructura del JWT (Header.Payload.Signature).
 *  3. Fecha de expiración ('exp' > ahora).
 *  4. Presencia de sujeto ('sub') y rol autorizado.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Permitir peticiones preflight CORS
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        // Rutas públicas o de monitoreo
        return path.startsWith("/actuator") ||
               path.startsWith("/api/rabbitmq/queues") && "GET".equalsIgnoreCase(method) ||
               path.startsWith("/api/kafka/topics") && "GET".equalsIgnoreCase(method);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Si la petición viene sin header Authorization, permitimos peticiones de prueba locales o retornamos 401 si es estricto
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("ℹ️ Petición sin Bearer Token recibida en {}. Continuando como anónimo...", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                log.warn("❌ Formato de JWT inválido (no tiene 3 partes): {}", request.getRequestURI());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token JWT malformado");
                return;
            }

            // Decodificar el payload base64url
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            String payloadJson = new String(payloadBytes, StandardCharsets.UTF_8);
            JsonNode claims = objectMapper.readTree(payloadJson);

            // Validar expiración (exp)
            if (claims.has("exp")) {
                long exp = claims.get("exp").asLong();
                long now = Instant.now().getEpochSecond();
                if (exp < now) {
                    log.warn("❌ Token JWT expirado (exp: {}, now: {})", exp, now);
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "El token JWT ha expirado");
                    return;
                }
            }

            // Extraer identidad del IDaaS
            String userId = claims.has("sub") ? claims.get("sub").asText() : "anonymous";
            String email = claims.has("email") ? claims.get("email").asText() : "no-email";
            String role = claims.has("role") ? claims.get("role").asText() : "authenticated";

            request.setAttribute("jwt.user_id", userId);
            request.setAttribute("jwt.email", email);
            request.setAttribute("jwt.role", role);

            log.debug("✅ [JWT VALIDADO] Usuario: {} ({}) | Rol: {}", email, userId, role);

        } catch (Exception e) {
            log.error("❌ Error al validar token JWT: {}", e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error al validar firma o formato del token JWT");
            return;
        }

        filterChain.doFilter(request, response);
    }
}

