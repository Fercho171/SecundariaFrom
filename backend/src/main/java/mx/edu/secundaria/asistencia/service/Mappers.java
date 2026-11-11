package mx.edu.secundaria.asistencia.service;

import mx.edu.secundaria.asistencia.dto.*;
import mx.edu.secundaria.asistencia.model.*;
import mx.edu.secundaria.asistencia.util.StatsUtil;

import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

/** Funciones de mapeo Entidad -> DTO. Los nombres de campo replican los modelos TypeScript del frontend. */
final class Mappers {

    private Mappers() {
    }

    static GroupDto group(Group g) {
        return new GroupDto(
            g.getId(), g.getGrade(), g.getLetter(), g.getName(), g.getStudentCount(),
            g.getTeacher().getId(), g.getTeacher().getFullName(), g.getSchoolYear()
        );
    }

    static StudentDto student(Student s, StatsUtil.StudentStats stats) {
        return new StudentDto(
            s.getId(), s.getStudentNumber(), s.getFirstName(), s.getLastName(), s.getFullName(),
            s.getGroup().getId(), s.getGroup().getName(), s.getStatus(),
            stats.percentage(), stats.absences(), stats.lates(), stats.justified(), stats.presents(),
            s.getSchoolYear()
        );
    }

    static AttendanceDto attendance(Attendance a) {
        return new AttendanceDto(
            a.getId(), a.getStudent().getId(), a.getStudent().getFullName(),
            a.getGroup().getId(), a.getGroup().getName(), a.getDate().toString(), a.getStatus(),
            a.getTeacher().getId(), a.getTeacher().getFullName(),
            a.getRecordedAt().truncatedTo(ChronoUnit.MILLIS).toString()
        );
    }

    static JustificationDto justification(Justification j) {
        return new JustificationDto(
            j.getId(), j.getStudent().getId(), j.getStudent().getFullName(), j.getStudent().getGroup().getName(),
            j.getDate().toString(), j.getReason(), j.getReason().getLabel(), j.getNotes(), j.getFileName(),
            j.getCreatedAt().truncatedTo(ChronoUnit.MILLIS).toString()
        );
    }

    static ClassPeriodDto period(ClassPeriod p) {
        return new ClassPeriodDto(p.getId(), p.getLabel(), p.getStartTime(), p.getEndTime());
    }

    static ScheduleSlotDto slot(ScheduleSlot s) {
        return new ScheduleSlotDto(
            s.getId(), s.getTeacher().getId(), s.getTeacher().getFullName(),
            s.getGroup().getId(), s.getGroup().getName(), s.getSubject(), s.getWeekday(),
            s.getPeriod().getId(), s.getClassroom()
        );
    }

    static TeacherAbsenceDto teacherAbsence(TeacherAbsence a) {
        return new TeacherAbsenceDto(
            a.getId(), a.getTeacher().getId(), a.getTeacher().getFullName(), a.getDate().toString(),
            a.getWeekday(), a.getReason(), a.getCoveredBy(), a.getAffectedPeriods(), a.getAffectedGroups()
        );
    }

    static CoverAssignmentDto coverAssignment(CoverAssignment c) {
        return new CoverAssignmentDto(
            c.getId(), c.getTitle(), c.getDate().toString(), c.getWeekday(),
            c.getGroup().getId(), c.getGroup().getName(), c.getPeriod().getId(),
            periodLabel(c.getPeriod()), c.getSubject(), c.getAbsentTeacherName(), c.getInstructions(),
            c.getFileName(), c.getFileType(), c.getCreatedAt().truncatedTo(ChronoUnit.MILLIS).toString()
        );
    }

    static String periodLabel(ClassPeriod p) {
        return p.getLabel() + " " + p.getStartTime() + "-" + p.getEndTime();
    }

    static UserDto user(User u) {
        return new UserDto(
            u.getId(), u.getUsername(), u.getEmail(), u.getFullName(), u.getRole(),
            u.getTeacher() != null ? u.getTeacher().getId() : null
        );
    }

    static TeacherDto teacher(Teacher t, List<String> groupIds) {
        return new TeacherDto(
            t.getId(), t.getFirstName(), t.getLastName(), t.getFullName(), t.getEmail(),
            groupIds, t.getSubject(), t.getContractedHours()
        );
    }
}
