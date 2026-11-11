package mx.edu.secundaria.asistencia.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "escuela")
public record AppProperties(String nombre, String cicloEscolar) {
}
