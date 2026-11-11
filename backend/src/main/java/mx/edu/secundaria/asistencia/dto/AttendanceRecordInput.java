package mx.edu.secundaria.asistencia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import mx.edu.secundaria.asistencia.model.AttendanceStatus;

public record AttendanceRecordInput(
    @NotBlank(message = "studentId es obligatorio.") String studentId,
    @NotNull(message = "status es obligatorio.") AttendanceStatus status
) {
}
