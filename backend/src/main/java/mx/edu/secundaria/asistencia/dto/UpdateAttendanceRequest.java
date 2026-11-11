package mx.edu.secundaria.asistencia.dto;

import jakarta.validation.constraints.NotNull;
import mx.edu.secundaria.asistencia.model.AttendanceStatus;

public record UpdateAttendanceRequest(
    @NotNull(message = "status es obligatorio.") AttendanceStatus status
) {
}
