package mx.edu.secundaria.asistencia.controller;

import mx.edu.secundaria.asistencia.dto.AttendanceReportDto;
import mx.edu.secundaria.asistencia.model.ReportType;
import mx.edu.secundaria.asistencia.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/attendance")
    public AttendanceReportDto getReport(
        @RequestParam(defaultValue = "DAILY") ReportType type,
        @RequestParam(required = false) String groupId,
        @RequestParam(required = false) String studentId,
        @RequestParam(required = false) LocalDate from,
        @RequestParam(required = false) LocalDate to,
        @RequestParam(required = false) String month
    ) {
        return reportService.getReport(type, groupId, studentId, from, to, month);
    }

    @GetMapping("/attendance/excel")
    public ResponseEntity<byte[]> exportCsv(
        @RequestParam(defaultValue = "DAILY") ReportType type,
        @RequestParam(required = false) String groupId,
        @RequestParam(required = false) String studentId,
        @RequestParam(required = false) LocalDate from,
        @RequestParam(required = false) LocalDate to,
        @RequestParam(required = false) String month
    ) {
        AttendanceReportDto report = reportService.getReport(type, groupId, studentId, from, to, month);
        byte[] csv = reportService.toCsv(report);
        String fileName = "reporte-asistencia-" + type.name().toLowerCase() + ".csv";
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType("text/csv;charset=utf-8"))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
            .body(csv);
    }

    @GetMapping("/attendance/pdf")
    public ResponseEntity<byte[]> exportPdf(
        @RequestParam(defaultValue = "DAILY") ReportType type,
        @RequestParam(required = false) String groupId,
        @RequestParam(required = false) String studentId,
        @RequestParam(required = false) LocalDate from,
        @RequestParam(required = false) LocalDate to,
        @RequestParam(required = false) String month
    ) {
        AttendanceReportDto report = reportService.getReport(type, groupId, studentId, from, to, month);
        byte[] pdf = reportService.toPdf(report);
        String fileName = "reporte-asistencia-" + type.name().toLowerCase() + ".pdf";
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
            .body(pdf);
    }
}
