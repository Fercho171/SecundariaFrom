package mx.edu.secundaria.asistencia.dto;

public record AttendanceSummaryDto(
    String groupId,
    String groupName,
    String date,
    int total,
    int presents,
    int absences,
    int justified,
    int lates,
    int unmarked,
    double percentage
) {
}
