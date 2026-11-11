package mx.edu.secundaria.asistencia.dto;

import mx.edu.secundaria.asistencia.model.UserRole;

public record UserDto(
    String id,
    String username,
    String email,
    String fullName,
    UserRole role,
    String teacherId
) {
}
