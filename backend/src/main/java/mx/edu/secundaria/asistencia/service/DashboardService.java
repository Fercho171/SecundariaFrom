package mx.edu.secundaria.asistencia.service;

import mx.edu.secundaria.asistencia.dto.AlertStudentDto;
import mx.edu.secundaria.asistencia.dto.AttendanceSummaryDto;
import mx.edu.secundaria.asistencia.dto.DashboardDto;
import mx.edu.secundaria.asistencia.dto.StudentDto;
import mx.edu.secundaria.asistencia.model.AlertLevel;
import mx.edu.secundaria.asistencia.model.Attendance;
import mx.edu.secundaria.asistencia.model.AttendanceStatus;
import mx.edu.secundaria.asistencia.model.Group;
import mx.edu.secundaria.asistencia.repository.AttendanceRepository;
import mx.edu.secundaria.asistencia.repository.GroupRepository;
import mx.edu.secundaria.asistencia.repository.JustificationRepository;
import mx.edu.secundaria.asistencia.repository.StudentRepository;
import mx.edu.secundaria.asistencia.util.StatsUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final GroupRepository groupRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final JustificationRepository justificationRepository;
    private final StudentService studentService;

    public DashboardService(
        GroupRepository groupRepository,
        StudentRepository studentRepository,
        AttendanceRepository attendanceRepository,
        JustificationRepository justificationRepository,
        StudentService studentService
    ) {
        this.groupRepository = groupRepository;
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.justificationRepository = justificationRepository;
        this.studentService = studentService;
    }

    public DashboardDto getDashboard() {
        LocalDate today = LocalDate.now();
        List<Attendance> todayRecords = attendanceRepository.findByDate(today);
        List<Group> groups = groupRepository.findAllByOrderByGradeAscLetterAsc();

        List<AttendanceSummaryDto> groupAttendance = groups.stream()
            .map(g -> summaryFor(g, today))
            .toList();

        int counted = todayRecords.size();
        long presents = todayRecords.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long absences = todayRecords.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        long justified = todayRecords.stream().filter(a -> a.getStatus() == AttendanceStatus.JUSTIFIED).count();
        long lates = todayRecords.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count();

        double todayPercentage = counted > 0
            ? StatsUtil.round1(((presents + lates + justified) * 100.0) / counted)
            : 0;

        return new DashboardDto(
            (int) studentRepository.count(),
            (int) groupRepository.count(),
            todayPercentage,
            (int) presents,
            (int) absences,
            (int) justified,
            (int) lates,
            (int) justificationRepository.count(),
            getAlerts(),
            groupAttendance
        );
    }

    public List<AlertStudentDto> getAlerts() {
        List<StudentDto> students = studentService.getStudents(null, null);
        return students.stream()
            .map(s -> {
                AlertLevel level = AlertLevel.fromAbsences(s.absences());
                if (level == null) {
                    return null;
                }
                return new AlertStudentDto(s.id(), s.fullName(), s.groupName(), s.absences(), s.attendancePercentage(), level);
            })
            .filter(java.util.Objects::nonNull)
            .sorted(Comparator.comparingInt(AlertStudentDto::absences).reversed())
            .toList();
    }

    private AttendanceSummaryDto summaryFor(Group group, LocalDate date) {
        List<Attendance> records = attendanceRepository.findByGroupIdAndDate(group.getId(), date);
        long presents = records.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long absences = records.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        long justified = records.stream().filter(a -> a.getStatus() == AttendanceStatus.JUSTIFIED).count();
        long lates = records.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count();
        int total = group.getStudentCount();
        int marked = records.size();
        double percentage = marked > 0 ? StatsUtil.round1(((presents + lates + justified) * 100.0) / marked) : 0;

        return new AttendanceSummaryDto(
            group.getId(), group.getName(), date.toString(), total,
            (int) presents, (int) absences, (int) justified, (int) lates,
            Math.max(total - marked, 0), percentage
        );
    }
}
