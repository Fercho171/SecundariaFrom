package mx.edu.secundaria.asistencia.security;

/** Representa al usuario autenticado extraído del JWT; se expone vía SecurityContext. */
public record AuthenticatedUser(
    String userId,
    String username,
    String email,
    String fullName,
    String role,
    String teacherId
) {
}
