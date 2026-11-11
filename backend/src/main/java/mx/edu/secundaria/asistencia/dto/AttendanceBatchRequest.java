package mx.edu.secundaria.asistencia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record AttendanceBatchRequest(
    @NotBlank(message = "groupId es obligatorio.") String groupId,
    @NotBlank(message = "date es obligatorio.") String date,
    @NotEmpty(message = "records no puede estar vacío.") List<AttendanceRecordInput> records
) {
}
