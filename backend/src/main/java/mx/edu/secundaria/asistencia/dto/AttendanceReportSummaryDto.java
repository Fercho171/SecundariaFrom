package mx.edu.secundaria.asistencia.dto;

public record AttendanceReportSummaryDto(
    int total,
    int presents,
    int absences,
    int justified,
    int lates,
    double percentage
) {
}
