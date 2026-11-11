package mx.edu.secundaria.asistencia.dto;

import java.util.List;

public record DashboardDto(
    int totalStudents,
    int totalGroups,
    double todayAttendancePercentage,
    int todayPresents,
    int todayAbsences,
    int todayJustified,
    int todayLates,
    int pendingJustifications,
    List<AlertStudentDto> alertStudents,
    List<AttendanceSummaryDto> groupAttendance
) {
}
