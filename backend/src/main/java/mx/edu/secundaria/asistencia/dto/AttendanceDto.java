package mx.edu.secundaria.asistencia.dto;

import mx.edu.secundaria.asistencia.model.AttendanceStatus;

public record AttendanceDto(
    String id,
    String studentId,
    String studentName,
    String groupId,
    String groupName,
    String date,
    AttendanceStatus status,
    String teacherId,
    String teacherName,
    String recordedAt
) {
}
