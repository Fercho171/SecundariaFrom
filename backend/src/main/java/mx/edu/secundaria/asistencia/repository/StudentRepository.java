package mx.edu.secundaria.asistencia.repository;

import mx.edu.secundaria.asistencia.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, String> {

    List<Student> findByGroupIdOrderByStudentNumberAsc(String groupId);

    @Query("""
        select s from Student s
        where (:groupId is null or s.group.id = :groupId)
          and (:term is null
               or lower(s.fullName) like concat('%', :term, '%')
               or cast(s.studentNumber as string) like concat('%', :term, '%'))
        order by s.studentNumber asc
        """)
    List<Student> search(@Param("term") String term, @Param("groupId") String groupId);
}
