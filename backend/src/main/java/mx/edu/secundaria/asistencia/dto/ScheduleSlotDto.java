package mx.edu.secundaria.asistencia.dto;

import mx.edu.secundaria.asistencia.model.Weekday;

public record ScheduleSlotDto(
    String id,
    String teacherId,
    String teacherName,
    String groupId,
    String groupName,
    String subject,
    Weekday weekday,
    int periodId,
    String classroom
) {
}
