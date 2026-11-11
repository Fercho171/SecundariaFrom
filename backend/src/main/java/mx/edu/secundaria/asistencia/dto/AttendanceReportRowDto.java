package mx.edu.secundaria.asistencia.dto;

public record AttendanceReportRowDto(
    String date,
    String studentName,
    String groupName,
    String status,
    Integer absences,
    Double percentage,
    String teacherName
) {
}
