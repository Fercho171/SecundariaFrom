package mx.edu.secundaria.asistencia.dto;

public record TeacherWorkHoursDto(
    String teacherId,
    String teacherName,
    String subject,
    int contractedHours,
    int weeklyClassHours,
    double dailyAverageHours,
    int absencesThisMonth,
    int workedHoursThisWeek
) {
}
