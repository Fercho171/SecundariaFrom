package mx.edu.secundaria.asistencia.repository;

import mx.edu.secundaria.asistencia.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, String> {

    List<Attendance> findByStudentIdOrderByDateDesc(String studentId);

    List<Attendance> findByGroupIdAndDate(String groupId, LocalDate date);

    Optional<Attendance> findByStudentIdAndDate(String studentId, LocalDate date);

    List<Attendance> findByDate(LocalDate date);

    void deleteByGroupIdAndDate(String groupId, LocalDate date);

    List<Attendance> findByStudentIdAndDateBetween(String studentId, LocalDate from, LocalDate to);

    List<Attendance> findByGroupIdAndDateBetween(String groupId, LocalDate from, LocalDate to);

    List<Attendance> findByDateBetween(LocalDate from, LocalDate to);

    @Query("""
        select a from Attendance a
        where (:studentId is null or a.student.id = :studentId)
          and (:groupId is null or a.group.id = :groupId)
          and (:status is null or a.status = :status)
          and (:date is null or a.date = :date)
          and (:from is null or a.date >= :from)
          and (:to is null or a.date <= :to)
        order by a.date desc, a.student.fullName asc
        """)
    List<Attendance> findByFilters(
        @Param("studentId") String studentId,
        @Param("groupId") String groupId,
        @Param("status") mx.edu.secundaria.asistencia.model.AttendanceStatus status,
        @Param("date") LocalDate date,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    long countByStudentIdAndStatus(String studentId, mx.edu.secundaria.asistencia.model.AttendanceStatus status);

    long countByStudentId(String studentId);

    List<Attendance> findByStudentIdIn(java.util.Collection<String> studentIds);
}
