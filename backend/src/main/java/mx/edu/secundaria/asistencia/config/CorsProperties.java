package mx.edu.secundaria.asistencia.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cors")
public record CorsProperties(String origenesPermitidos) {
}
