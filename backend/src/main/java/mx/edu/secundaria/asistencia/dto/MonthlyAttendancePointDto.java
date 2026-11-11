package mx.edu.secundaria.asistencia.dto;

public record MonthlyAttendancePointDto(
    String month,
    String monthLabel,
    double percentage,
    int presents,
    int absences,
    int justified,
    int lates
) {
}
