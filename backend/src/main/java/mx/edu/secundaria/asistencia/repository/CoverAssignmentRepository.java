package mx.edu.secundaria.asistencia.repository;

import mx.edu.secundaria.asistencia.model.CoverAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CoverAssignmentRepository extends JpaRepository<CoverAssignment, String> {
    List<CoverAssignment> findByDateOrderByCreatedAtDesc(LocalDate date);

    List<CoverAssignment> findAllByOrderByCreatedAtDesc();

    boolean existsByDateAndGroupIdAndPeriodId(LocalDate date, String groupId, Integer periodId);
}
