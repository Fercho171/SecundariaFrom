package mx.edu.secundaria.asistencia.dto;

import mx.edu.secundaria.asistencia.model.JustificationReason;

public record JustificationDto(
    String id,
    String studentId,
    String studentName,
    String groupName,
    String date,
    JustificationReason reason,
    String reasonLabel,
    String notes,
    String fileName,
    String createdAt
) {
}
