package mx.edu.secundaria.asistencia.service;

import mx.edu.secundaria.asistencia.dto.*;
import mx.edu.secundaria.asistencia.model.Attendance;
import mx.edu.secundaria.asistencia.model.ReportType;
import mx.edu.secundaria.asistencia.repository.AttendanceRepository;
import mx.edu.secundaria.asistencia.util.StatsUtil;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private final AttendanceRepository attendanceRepository;
    private final StudentService studentService;

    public ReportService(AttendanceRepository attendanceRepository, StudentService studentService) {
        this.attendanceRepository = attendanceRepository;
        this.studentService = studentService;
    }

    public AttendanceReportDto getReport(
        ReportType type, String groupId, String studentId, LocalDate fromParam, LocalDate toParam, String month
    ) {
        LocalDate today = LocalDate.now();
        LocalDate from = fromParam != null ? fromParam
            : type == ReportType.DAILY ? today
            : month != null ? YearMonth.parse(month).atDay(1)
            : today.minusDays(30);
        LocalDate to = toParam != null ? toParam : today;

        List<AttendanceReportRowDto> rows;

        if (type == ReportType.TOP_ABSENCES) {
            rows = studentService.getStudents(null, null).stream()
                .sorted(Comparator.comparingInt(StudentDto::absences).reversed())
                .limit(20)
                .map(s -> new AttendanceReportRowDto(null, s.fullName(), s.groupName(), null, s.absences(), s.attendancePercentage(), null))
                .toList();
        } else if (type == ReportType.BY_STUDENT && studentId != null && !studentId.isBlank()) {
            rows = attendanceRepository.findByFilters(studentId, null, null, null, from, to).stream()
                .map(this::toRow)
                .toList();
        } else {
            rows = attendanceRepository.findByFilters(null, groupId, null, null, from, to).stream()
                .map(this::toRow)
                .toList();
        }

        long presents = rows.stream().filter(r -> "PRESENT".equals(r.status())).count();
        long absences = rows.stream().filter(r -> "ABSENT".equals(r.status())).count();
        long justified = rows.stream().filter(r -> "JUSTIFIED".equals(r.status())).count();
        long lates = rows.stream().filter(r -> "LATE".equals(r.status())).count();
        int total = rows.isEmpty() ? 1 : rows.size();
        double percentage = StatsUtil.round1(((presents + lates + justified) * 100.0) / total);

        AttendanceReportSummaryDto summary = new AttendanceReportSummaryDto(
            rows.size(), (int) presents, (int) absences, (int) justified, (int) lates, percentage
        );

        return new AttendanceReportDto(type, java.time.Instant.now().toString(), from.toString(), to.toString(), rows, summary);
    }

    private AttendanceReportRowDto toRow(Attendance a) {
        return new AttendanceReportRowDto(
            a.getDate().toString(), a.getStudent().getFullName(), a.getGroup().getName(),
            a.getStatus().name(), null, null, a.getTeacher().getFullName()
        );
    }

    public byte[] toCsv(AttendanceReportDto report) {
        StringBuilder sb = new StringBuilder();
        sb.append("Fecha,Alumno,Grupo,Estado,Faltas,Porcentaje,Docente\n");
        for (AttendanceReportRowDto row : report.rows()) {
            sb.append(csv(row.date())).append(',')
                .append(csv(row.studentName())).append(',')
                .append(csv(row.groupName())).append(',')
                .append(csv(row.status())).append(',')
                .append(csv(row.absences())).append(',')
                .append(csv(row.percentage())).append(',')
                .append(csv(row.teacherName())).append('\n');
        }
        byte[] bom = new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        byte[] content = sb.toString().getBytes(StandardCharsets.UTF_8);
        byte[] result = new byte[bom.length + content.length];
        System.arraycopy(bom, 0, result, 0, bom.length);
        System.arraycopy(content, 0, result, bom.length, content.length);
        return result;
    }

    private String csv(Object value) {
        return "\"" + (value == null ? "" : value.toString()) + "\"";
    }

    public byte[] toPdf(AttendanceReportDto report) {
        try (PDDocument document = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            document.addPage(page);

            String title = "Reporte de asistencia " + report.type();
            String summary = String.format(
                "Total %d | Presentes %d | Faltas %d | Justificados %d | Retardos %d | %%: %.1f",
                report.summary().total(), report.summary().presents(), report.summary().absences(),
                report.summary().justified(), report.summary().lates(), report.summary().percentage()
            );
            String range = "Periodo: " + report.from() + " a " + report.to();

            try (PDPageContentStream stream = new PDPageContentStream(document, page)) {
                var titleFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                var bodyFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

                stream.beginText();
                stream.setFont(titleFont, 16);
                stream.newLineAtOffset(50, 750);
                stream.showText(title);
                stream.endText();

                stream.beginText();
                stream.setFont(bodyFont, 11);
                stream.newLineAtOffset(50, 724);
                stream.showText(range);
                stream.endText();

                stream.beginText();
                stream.setFont(bodyFont, 11);
                stream.newLineAtOffset(50, 706);
                stream.showText(summary);
                stream.endText();

                int y = 670;
                stream.beginText();
                stream.setFont(titleFont, 10);
                stream.newLineAtOffset(50, y);
                stream.showText("Fecha        Alumno                         Grupo   Estado      Docente");
                stream.endText();
                y -= 16;

                for (AttendanceReportRowDto row : report.rows()) {
                    if (y < 50) {
                        break; // límite de una página para este reporte simple
                    }
                    String line = String.format(
                        "%-12s %-30s %-7s %-11s %s",
                        nullToDash(row.date()), truncate(nullToDash(row.studentName()), 30),
                        nullToDash(row.groupName()), nullToDash(row.status()), nullToDash(row.teacherName())
                    );
                    stream.beginText();
                    stream.setFont(bodyFont, 9);
                    stream.newLineAtOffset(50, y);
                    stream.showText(line);
                    stream.endText();
                    y -= 13;
                }
            }

            document.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("No se pudo generar el PDF del reporte.", e);
        }
    }

    private String nullToDash(String value) {
        return value == null ? "-" : value;
    }

    private String truncate(String value, int max) {
        return value.length() > max ? value.substring(0, max - 3) + "..." : value;
    }
}
