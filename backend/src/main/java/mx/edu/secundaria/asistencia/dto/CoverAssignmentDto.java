package mx.edu.secundaria.asistencia.dto;

import mx.edu.secundaria.asistencia.model.CoverFileType;
import mx.edu.secundaria.asistencia.model.Weekday;

public record CoverAssignmentDto(
    String id,
    String title,
    String date,
    Weekday weekday,
    String groupId,
    String groupName,
    int periodId,
    String periodLabel,
    String subject,
    String absentTeacherName,
    String instructions,
    String fileName,
    CoverFileType fileType,
    String createdAt
) {
}
