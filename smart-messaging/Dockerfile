# Imagen base con Maven y Java 17
FROM maven:3.9.6-eclipse-temurin-17

WORKDIR /app

# Copiar el descriptor pom.xml y codigo fuente
COPY pom.xml .
COPY src ./src

# Exponer el puerto 8080 para la API REST del backend
EXPOSE 8080

# Comando para ejecutar Spring Boot en modo desarrollo
CMD ["mvn", "spring-boot:run"]
