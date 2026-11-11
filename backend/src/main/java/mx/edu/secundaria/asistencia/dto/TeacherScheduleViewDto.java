package mx.edu.secundaria.asistencia.dto;

import java.util.List;

public record TeacherScheduleViewDto(
    String teacherId,
    String teacherName,
    String subject,
    String email,
    List<String> groupNames,
    List<ScheduleSlotDto> slots,
    int weeklyHours
) {
}
