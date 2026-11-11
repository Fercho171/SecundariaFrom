package mx.edu.secundaria.asistencia.dto;

import java.util.List;

public record TeacherDto(
    String id,
    String firstName,
    String lastName,
    String fullName,
    String email,
    List<String> groupIds,
    String subject,
    int contractedHours
) {
}
