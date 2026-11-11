package mx.edu.secundaria.asistencia.dto;

import mx.edu.secundaria.asistencia.model.AlertLevel;

public record AlertStudentDto(
    String studentId,
    String studentName,
    String groupName,
    int absences,
    double attendancePercentage,
    AlertLevel level
) {
}
