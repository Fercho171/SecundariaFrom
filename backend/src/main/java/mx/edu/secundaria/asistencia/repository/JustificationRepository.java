package mx.edu.secundaria.asistencia.repository;

import mx.edu.secundaria.asistencia.model.Justification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JustificationRepository extends JpaRepository<Justification, String> {
    List<Justification> findAllByOrderByDateDesc();
}
