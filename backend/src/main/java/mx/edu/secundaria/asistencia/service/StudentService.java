package mx.edu.secundaria.asistencia.service;

import mx.edu.secundaria.asistencia.dto.MonthlyAttendancePointDto;
import mx.edu.secundaria.asistencia.dto.StudentAttendanceDayDto;
import mx.edu.secundaria.asistencia.dto.StudentDto;
import mx.edu.secundaria.asistencia.dto.StudentProfileDto;
import mx.edu.secundaria.asistencia.exception.ApiException;
import mx.edu.secundaria.asistencia.model.Attendance;
import mx.edu.secundaria.asistencia.model.Student;
import mx.edu.secundaria.asistencia.repository.AttendanceRepository;
import mx.edu.secundaria.asistencia.repository.StudentRepository;
import mx.edu.secundaria.asistencia.util.StatsUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class StudentService {

    private static final String[] MONTH_LABELS = {"Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"};

    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;

    public StudentService(StudentRepository studentRepository, AttendanceRepository attendanceRepository) {
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
    }

    public List<StudentDto> getStudents(String search, String groupId) {
        List<Student> students = studentRepository.search(
            search != null && !search.isBlank() ? search.trim().toLowerCase() : null,
            groupId != null && !groupId.isBlank() ? groupId : null
        );
        if (students.isEmpty()) {
            return List.of();
        }
        List<String> ids = students.stream().map(Student::getId).toList();
        Map<String, List<Attendance>> byStudent = attendanceRepository.findByStudentIdIn(ids).stream()
            .collect(Collectors.groupingBy(a -> a.getStudent().getId()));

        return students.stream()
            .map(s -> Mappers.student(s, StatsUtil.studentStats(byStudent.getOrDefault(s.getId(), List.of()))))
            .toList();
    }

    public Student requireStudent(String id) {
        return studentRepository.findById(id)
            .orElseThrow(() -> ApiException.notFound("No se encontró el alumno."));
    }

    public StudentProfileDto getStudent(String id) {
        Student student = requireStudent(id);
        List<Attendance> records = attendanceRepository.findByStudentIdOrderByDateDesc(id);
        StatsUtil.StudentStats stats = StatsUtil.studentStats(records);

        List<StudentAttendanceDayDto> history = records.stream()
            .map(a -> new StudentAttendanceDayDto(a.getDate().toString(), a.getStatus(), a.getTeacher().getFullName()))
            .toList();

        return new StudentProfileDto(
            student.getId(), student.getStudentNumber(), student.getFirstName(), student.getLastName(),
            student.getFullName(), student.getGroup().getId(), student.getGroup().getName(), student.getStatus(),
            stats.percentage(), stats.absences(), stats.lates(), stats.justified(), stats.presents(),
            student.getSchoolYear(), monthlyAttendance(records), history
        );
    }

    private List<MonthlyAttendancePointDto> monthlyAttendance(List<Attendance> records) {
        YearMonth current = YearMonth.now();
        return java.util.stream.IntStream.rangeClosed(0, 5)
            .mapToObj(i -> current.minusMonths(5 - i))
            .map(month -> {
                List<Attendance> inMonth = records.stream()
                    .filter(a -> YearMonth.from(a.getDate()).equals(month))
                    .toList();
                StatsUtil.StudentStats stats = StatsUtil.studentStats(inMonth);
                String key = month.toString(); // yyyy-MM
                return new MonthlyAttendancePointDto(
                    key, MONTH_LABELS[month.getMonthValue() - 1],
                    stats.percentage(), stats.presents(), stats.absences(), stats.justified(), stats.lates()
                );
            })
            .toList();
    }
}
