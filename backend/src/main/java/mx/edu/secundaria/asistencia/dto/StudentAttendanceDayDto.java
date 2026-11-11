package mx.edu.secundaria.asistencia.dto;

import mx.edu.secundaria.asistencia.model.AttendanceStatus;

public record StudentAttendanceDayDto(
    String date,
    AttendanceStatus status,
    String teacherName
) {
}
