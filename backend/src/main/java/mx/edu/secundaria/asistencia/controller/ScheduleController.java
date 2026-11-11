package mx.edu.secundaria.asistencia.controller;

import mx.edu.secundaria.asistencia.dto.*;
import mx.edu.secundaria.asistencia.model.CoverAssignment;
import mx.edu.secundaria.asistencia.model.Weekday;
import mx.edu.secundaria.asistencia.service.ScheduleService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/periods")
    public List<ClassPeriodDto> getPeriods() {
        return scheduleService.getPeriods();
    }

    @GetMapping("/classes")
    public List<ScheduleSlotDto> getClassSchedule(
        @RequestParam(required = false) Weekday weekday,
        @RequestParam(required = false) String groupId
    ) {
        return scheduleService.getClassSchedule(weekday, groupId);
    }

    @GetMapping("/teachers")
    public List<TeacherScheduleViewDto> getTeacherSchedules() {
        return scheduleService.getTeacherSchedules();
    }

    @GetMapping("/teachers/{teacherId}")
    public TeacherScheduleViewDto getTeacherSchedule(@PathVariable String teacherId) {
        return scheduleService.getTeacherSchedule(teacherId);
    }

    @GetMapping("/absences")
    public List<TeacherAbsenceDto> getTeacherAbsences(@RequestParam(required = false) LocalDate date) {
        return scheduleService.getTeacherAbsences(date);
    }

    @GetMapping("/work-hours")
    public List<TeacherWorkHoursDto> getWorkHours() {
        return scheduleService.getWorkHours();
    }

    @GetMapping("/uncovered-hours")
    public List<UncoveredHourDto> getUncoveredHours(@RequestParam(required = false) LocalDate date) {
        return scheduleService.getUncoveredHours(date);
    }

    @GetMapping("/cover-work")
    public List<CoverAssignmentDto> getCoverAssignments(@RequestParam(required = false) LocalDate date) {
        return scheduleService.getCoverAssignments(date);
    }

    @PostMapping(value = "/cover-work", consumes = "multipart/form-data")
    public CoverAssignmentDto createCoverAssignment(
        @RequestParam String title,
        @RequestParam String date,
        @RequestParam String groupId,
        @RequestParam Integer periodId,
        @RequestParam(required = false) String absentTeacherName,
        @RequestParam(required = false) String subject,
        @RequestParam(required = false) String instructions,
        @RequestParam MultipartFile file
    ) {
        return scheduleService.createCoverAssignment(
            title, date, groupId, periodId, absentTeacherName, subject, instructions, file
        );
    }

    @GetMapping("/cover-work/{id}/file")
    public ResponseEntity<byte[]> downloadCoverFile(@PathVariable String id) {
        CoverAssignment assignment = scheduleService.requireCoverFile(id);
        String contentType = assignment.getFileContentType() != null
            ? assignment.getFileContentType()
            : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        String fileName = assignment.getFileName() != null ? assignment.getFileName() : "archivo";
        String encoded = java.net.URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encoded)
            .body(assignment.getFileData());
    }
}
