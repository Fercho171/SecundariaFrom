package mx.edu.secundaria.asistencia.repository;

import mx.edu.secundaria.asistencia.model.ScheduleSlot;
import mx.edu.secundaria.asistencia.model.Weekday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScheduleSlotRepository extends JpaRepository<ScheduleSlot, String> {

    List<ScheduleSlot> findByTeacherId(String teacherId);

    @Query("""
        select s from ScheduleSlot s
        where (:weekday is null or s.weekday = :weekday)
          and (:groupId is null or s.group.id = :groupId)
        order by s.period.id asc, s.group.name asc
        """)
    List<ScheduleSlot> findByFilters(@Param("weekday") Weekday weekday, @Param("groupId") String groupId);

    List<ScheduleSlot> findByTeacherIdAndWeekdayAndPeriodId(String teacherId, Weekday weekday, Integer periodId);
}
