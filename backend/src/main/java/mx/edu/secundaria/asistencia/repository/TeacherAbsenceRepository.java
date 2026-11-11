package mx.edu.secundaria.asistencia.repository;

import mx.edu.secundaria.asistencia.model.TeacherAbsence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TeacherAbsenceRepository extends JpaRepository<TeacherAbsence, String> {
    List<TeacherAbsence> findByDateOrderByTeacherFullNameAsc(LocalDate date);

    List<TeacherAbsence> findByTeacherIdAndDateBetween(String teacherId, LocalDate from, LocalDate to);

    List<TeacherAbsence> findByTeacherIdAndDate(String teacherId, LocalDate date);

    List<TeacherAbsence> findAllByOrderByDateDescTeacherFullNameAsc();
}
