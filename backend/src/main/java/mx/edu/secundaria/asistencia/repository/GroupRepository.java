package mx.edu.secundaria.asistencia.repository;

import mx.edu.secundaria.asistencia.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupRepository extends JpaRepository<Group, String> {
    List<Group> findByTeacherIdOrderByGradeAscLetterAsc(String teacherId);

    List<Group> findAllByOrderByGradeAscLetterAsc();

    java.util.Optional<Group> findByName(String name);
}
