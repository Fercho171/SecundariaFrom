package mx.edu.secundaria.asistencia.repository;

import mx.edu.secundaria.asistencia.model.ClassPeriod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassPeriodRepository extends JpaRepository<ClassPeriod, Integer> {
    List<ClassPeriod> findAllByOrderByIdAsc();
}
