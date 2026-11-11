package mx.edu.secundaria.asistencia.controller;

import jakarta.validation.Valid;
import mx.edu.secundaria.asistencia.dto.AttendanceBatchRequest;
import mx.edu.secundaria.asistencia.dto.AttendanceDto;
import mx.edu.secundaria.asistencia.dto.UpdateAttendanceRequest;
import mx.edu.secundaria.asistencia.model.AttendanceStatus;
import mx.edu.secundaria.asistencia.service.AttendanceService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    public List<AttendanceDto> saveAttendance(@Valid @RequestBody AttendanceBatchRequest request) {
        return attendanceService.saveAttendance(request);
    }

    @GetMapping
    public List<AttendanceDto> getAttendance(
        @RequestParam(required = false) String studentId,
        @RequestParam(required = false) String groupId,
        @RequestParam(required = false) AttendanceStatus status,
        @RequestParam(required = false) LocalDate date,
        @RequestParam(required = false) LocalDate from,
        @RequestParam(required = false) LocalDate to
    ) {
        return attendanceService.getAttendance(studentId, groupId, status, date, from, to);
    }

    @GetMapping("/student/{studentId}")
    public List<AttendanceDto> getByStudent(@PathVariable String studentId) {
        return attendanceService.getByStudent(studentId);
    }

    @GetMapping("/group/{groupId}")
    public List<AttendanceDto> getByGroup(
        @PathVariable String groupId,
        @RequestParam(required = false) LocalDate date
    ) {
        return attendanceService.getByGroup(groupId, date);
    }

    @PutMapping("/{id}")
    public AttendanceDto updateAttendance(@PathVariable String id, @Valid @RequestBody UpdateAttendanceRequest request) {
        return attendanceService.updateAttendance(id, request.status());
    }
}
