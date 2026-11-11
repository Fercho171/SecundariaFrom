package mx.edu.secundaria.asistencia.dto;

import mx.edu.secundaria.asistencia.model.StudentStatus;

import java.util.List;

public record StudentProfileDto(
    String id,
    int studentNumber,
    String firstName,
    String lastName,
    String fullName,
    String groupId,
    String groupName,
    StudentStatus status,
    double attendancePercentage,
    int absences,
    int lates,
    int justified,
    int presents,
    String schoolYear,
    List<MonthlyAttendancePointDto> monthlyAttendance,
    List<StudentAttendanceDayDto> history
) {
}
