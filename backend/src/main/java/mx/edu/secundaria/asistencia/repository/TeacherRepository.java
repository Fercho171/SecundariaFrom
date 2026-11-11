package mx.edu.secundaria.asistencia.repository;

import mx.edu.secundaria.asistencia.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository extends JpaRepository<Teacher, String> {
}
