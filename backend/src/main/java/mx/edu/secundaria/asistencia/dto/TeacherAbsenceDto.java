package mx.edu.secundaria.asistencia.dto;

import mx.edu.secundaria.asistencia.model.Weekday;

import java.util.List;

public record TeacherAbsenceDto(
    String id,
    String teacherId,
    String teacherName,
    String date,
    Weekday weekday,
    String reason,
    String coveredBy,
    List<Integer> affectedPeriods,
    List<String> affectedGroups
) {
}
