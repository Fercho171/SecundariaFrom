package mx.edu.secundaria.asistencia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class AsistenciaBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(AsistenciaBackendApplication.class, args);
    }
}
