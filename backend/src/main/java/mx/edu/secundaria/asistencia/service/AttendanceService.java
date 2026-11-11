package mx.edu.secundaria.asistencia.service;

import mx.edu.secundaria.asistencia.dto.AttendanceBatchRequest;
import mx.edu.secundaria.asistencia.dto.AttendanceDto;
import mx.edu.secundaria.asistencia.dto.AttendanceRecordInput;
import mx.edu.secundaria.asistencia.exception.ApiException;
import mx.edu.secundaria.asistencia.model.Attendance;
import mx.edu.secundaria.asistencia.model.AttendanceStatus;
import mx.edu.secundaria.asistencia.model.Group;
import mx.edu.secundaria.asistencia.model.Student;
import mx.edu.secundaria.asistencia.repository.AttendanceRepository;
import mx.edu.secundaria.asistencia.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final GroupService groupService;

    public AttendanceService(AttendanceRepository attendanceRepository, StudentRepository studentRepository, GroupService groupService) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.groupService = groupService;
    }

    public List<AttendanceDto> getAttendance(String studentId, String groupId, AttendanceStatus status, LocalDate date, LocalDate from, LocalDate to) {
        return attendanceRepository.findByFilters(
                emptyToNull(studentId), emptyToNull(groupId), status, date, from, to
            ).stream()
            .map(Mappers::attendance)
            .toList();
    }

    public List<AttendanceDto> getByStudent(String studentId) {
        return attendanceRepository.findByStudentIdOrderByDateDesc(studentId).stream().map(Mappers::attendance).toList();
    }

    public List<AttendanceDto> getByGroup(String groupId, LocalDate date) {
        Group group = groupService.requireGroup(groupId);
        List<Attendance> records = date != null
            ? attendanceRepository.findByGroupIdAndDate(group.getId(), date)
            : attendanceRepository.findByFilters(null, group.getId(), null, null, null, null);
        return records.stream().map(Mappers::attendance).toList();
    }

    @Transactional
    public List<AttendanceDto> saveAttendance(AttendanceBatchRequest request) {
        Group group = groupService.requireGroup(request.groupId());
        LocalDate date = parseDate(request.date());
        List<Student> students = studentRepository.findByGroupIdOrderByStudentNumberAsc(group.getId());

        if (request.records().size() != students.size()) {
            throw ApiException.badRequest("La lista está incompleta. Todos los alumnos deben tener un estado.");
        }
        boolean missing = request.records().stream()
            .anyMatch(r -> r.studentId() == null || r.studentId().isBlank() || r.status() == null);
        if (missing) {
            throw ApiException.badRequest("La lista está incompleta. Todos los alumnos deben tener un estado.");
        }
        Set<String> uniqueIds = new HashSet<>();
        for (AttendanceRecordInput record : request.records()) {
            if (!uniqueIds.add(record.studentId())) {
                throw ApiException.conflict("Ya existe un registro de asistencia para este alumno.");
            }
        }

        Map<String, Student> byId = students.stream().collect(Collectors.toMap(Student::getId, Function.identity()));

        attendanceRepository.deleteByGroupIdAndDate(group.getId(), date);
        attendanceRepository.flush();

        Instant now = Instant.now();
        List<Attendance> saved = request.records().stream().map(record -> {
            Student student = byId.get(record.studentId());
            if (student == null) {
                throw ApiException.badRequest("El alumno " + record.studentId() + " no pertenece a este grupo.");
            }
            Attendance attendance = new Attendance();
            attendance.setId("att-" + UUID.randomUUID());
            attendance.setStudent(student);
            attendance.setGroup(group);
            attendance.setDate(date);
            attendance.setStatus(record.status());
            attendance.setTeacher(group.getTeacher());
            attendance.setRecordedAt(now);
            return attendance;
        }).toList();

        attendanceRepository.saveAll(saved);
        return saved.stream().map(Mappers::attendance).toList();
    }

    @Transactional
    public AttendanceDto updateAttendance(String id, AttendanceStatus status) {
        Attendance attendance = attendanceRepository.findById(id)
            .orElseThrow(() -> ApiException.notFound("No se encontró el registro de asistencia."));
        attendance.setStatus(status);
        attendance.setRecordedAt(Instant.now());
        attendanceRepository.save(attendance);
        return Mappers.attendance(attendance);
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (Exception e) {
            throw ApiException.badRequest("La fecha no es válida.");
        }
    }

    private String emptyToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }
}
