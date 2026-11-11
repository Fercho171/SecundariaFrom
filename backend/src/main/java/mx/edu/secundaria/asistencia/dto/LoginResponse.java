package mx.edu.secundaria.asistencia.dto;

public record LoginResponse(
    String token,
    UserDto user
) {
}
