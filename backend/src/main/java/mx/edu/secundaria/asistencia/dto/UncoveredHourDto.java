package mx.edu.secundaria.asistencia.dto;

import mx.edu.secundaria.asistencia.model.Weekday;

public record UncoveredHourDto(
    String date,
    Weekday weekday,
    String groupId,
    String groupName,
    int periodId,
    String periodLabel,
    String subject,
    String absentTeacherName,
    String reason,
    boolean hasWork
) {
}
