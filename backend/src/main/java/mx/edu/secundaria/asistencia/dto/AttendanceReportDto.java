package mx.edu.secundaria.asistencia.dto;

import mx.edu.secundaria.asistencia.model.ReportType;

import java.util.List;

public record AttendanceReportDto(
    ReportType type,
    String generatedAt,
    String from,
    String to,
    List<AttendanceReportRowDto> rows,
    AttendanceReportSummaryDto summary
) {
}
