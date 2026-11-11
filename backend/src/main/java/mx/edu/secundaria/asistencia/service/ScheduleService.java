package mx.edu.secundaria.asistencia.service;

import mx.edu.secundaria.asistencia.dto.*;
import mx.edu.secundaria.asistencia.exception.ApiException;
import mx.edu.secundaria.asistencia.model.*;
import mx.edu.secundaria.asistencia.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ScheduleService {

    private final ClassPeriodRepository periodRepository;
    private final ScheduleSlotRepository slotRepository;
    private final TeacherRepository teacherRepository;
    private final GroupRepository groupRepository;
    private final TeacherAbsenceRepository absenceRepository;
    private final CoverAssignmentRepository coverAssignmentRepository;

    public ScheduleService(
        ClassPeriodRepository periodRepository,
        ScheduleSlotRepository slotRepository,
        TeacherRepository teacherRepository,
        GroupRepository groupRepository,
        TeacherAbsenceRepository absenceRepository,
        CoverAssignmentRepository coverAssignmentRepository
    ) {
        this.periodRepository = periodRepository;
        this.slotRepository = slotRepository;
        this.teacherRepository = teacherRepository;
        this.groupRepository = groupRepository;
        this.absenceRepository = absenceRepository;
        this.coverAssignmentRepository = coverAssignmentRepository;
    }

    public List<ClassPeriodDto> getPeriods() {
        return periodRepository.findAllByOrderByIdAsc().stream().map(Mappers::period).toList();
    }

    public List<ScheduleSlotDto> getClassSchedule(Weekday weekday, String groupId) {
        return slotRepository.findByFilters(weekday, blankToNull(groupId)).stream().map(Mappers::slot).toList();
    }

    public List<TeacherScheduleViewDto> getTeacherSchedules() {
        return teacherRepository.findAll().stream()
            .map(this::buildTeacherSchedule)
            .toList();
    }

    public TeacherScheduleViewDto getTeacherSchedule(String teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() -> ApiException.notFound("No se encontró el horario del docente."));
        return buildTeacherSchedule(teacher);
    }

    private TeacherScheduleViewDto buildTeacherSchedule(Teacher teacher) {
        List<ScheduleSlot> slots = slotRepository.findByTeacherId(teacher.getId()).stream()
            .sorted(Comparator
                .comparingInt((ScheduleSlot s) -> s.getWeekday().ordinal())
                .thenComparingInt(s -> s.getPeriod().getId()))
            .toList();
        List<String> groupNames = groupRepository.findByTeacherIdOrderByGradeAscLetterAsc(teacher.getId()).stream()
            .map(Group::getName)
            .toList();
        return new TeacherScheduleViewDto(
            teacher.getId(), teacher.getFullName(), teacher.getSubject(), teacher.getEmail(),
            groupNames, slots.stream().map(Mappers::slot).toList(), slots.size()
        );
    }

    public List<TeacherAbsenceDto> getTeacherAbsences(LocalDate date) {
        LocalDate target = date != null ? date : LocalDate.now();
        return absenceRepository.findByDateOrderByTeacherFullNameAsc(target).stream().map(Mappers::teacherAbsence).toList();
    }

    public List<TeacherWorkHoursDto> getWorkHours() {
        LocalDate today = LocalDate.now();
        YearMonth month = YearMonth.from(today);
        return teacherRepository.findAll().stream().map(teacher -> {
            int weeklyClassHours = slotRepository.findByTeacherId(teacher.getId()).size();
            int absencesThisMonth = absenceRepository
                .findByTeacherIdAndDateBetween(teacher.getId(), month.atDay(1), month.atEndOfMonth())
                .size();
            boolean absentToday = !absenceRepository.findByTeacherIdAndDate(teacher.getId(), today).isEmpty();
            double dailyAverage = Math.round((weeklyClassHours / 5.0) * 10) / 10.0;
            int workedHoursThisWeek = Math.max(weeklyClassHours - (absentToday ? 2 : 0), 0);
            return new TeacherWorkHoursDto(
                teacher.getId(), teacher.getFullName(), teacher.getSubject(), teacher.getContractedHours(),
                weeklyClassHours, dailyAverage, absencesThisMonth, workedHoursThisWeek
            );
        }).toList();
    }

    public List<UncoveredHourDto> getUncoveredHours(LocalDate date) {
        LocalDate target = date != null ? date : LocalDate.now();
        List<UncoveredHourDto> hours = new java.util.ArrayList<>();

        for (TeacherAbsence absence : absenceRepository.findByDateOrderByTeacherFullNameAsc(target)) {
            if (absence.getCoveredBy() != null && !absence.getCoveredBy().isBlank()) {
                continue;
            }
            List<Integer> periodIds = !absence.getAffectedPeriods().isEmpty()
                ? absence.getAffectedPeriods()
                : periodRepository.findAllByOrderByIdAsc().stream().map(ClassPeriod::getId).toList();

            for (Integer periodId : periodIds) {
                ClassPeriod period = periodRepository.findById(periodId).orElse(null);
                String periodLabel = period != null ? Mappers.periodLabel(period) : periodId + "ª";
                List<ScheduleSlot> slots = slotRepository.findByTeacherIdAndWeekdayAndPeriodId(
                    absence.getTeacher().getId(), absence.getWeekday(), periodId
                );

                if (!slots.isEmpty()) {
                    for (ScheduleSlot slot : slots) {
                        hours.add(new UncoveredHourDto(
                            target.toString(), absence.getWeekday(), slot.getGroup().getId(), slot.getGroup().getName(),
                            periodId, periodLabel, slot.getSubject(), absence.getTeacher().getFullName(),
                            absence.getReason(),
                            coverAssignmentRepository.existsByDateAndGroupIdAndPeriodId(target, slot.getGroup().getId(), periodId)
                        ));
                    }
                } else {
                    for (String groupName : absence.getAffectedGroups()) {
                        Group group = groupRepository.findByName(groupName).orElse(null);
                        String groupId = group != null ? group.getId() : "";
                        hours.add(new UncoveredHourDto(
                            target.toString(), absence.getWeekday(), groupId, groupName,
                            periodId, periodLabel, absence.getTeacher().getSubject(), absence.getTeacher().getFullName(),
                            absence.getReason(),
                            !groupId.isBlank() && coverAssignmentRepository.existsByDateAndGroupIdAndPeriodId(target, groupId, periodId)
                        ));
                    }
                }
            }
        }

        return hours.stream()
            .sorted(Comparator.comparingInt(UncoveredHourDto::periodId).thenComparing(UncoveredHourDto::groupName))
            .toList();
    }

    public List<CoverAssignmentDto> getCoverAssignments(LocalDate date) {
        List<CoverAssignment> assignments = date != null
            ? coverAssignmentRepository.findByDateOrderByCreatedAtDesc(date)
            : coverAssignmentRepository.findAllByOrderByCreatedAtDesc();
        return assignments.stream().map(Mappers::coverAssignment).toList();
    }

    @Transactional
    public CoverAssignmentDto createCoverAssignment(
        String title, String dateStr, String groupId, Integer periodId,
        String absentTeacherName, String subject, String instructions, MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("Adjunta un archivo PDF, imagen, Word o Excel.");
        }
        CoverFileType fileType = CoverFileType.fromFileName(file.getOriginalFilename());
        if (fileType == null) {
            throw ApiException.badRequest("Solo se permiten PDF, imágenes, Word o Excel.");
        }

        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> ApiException.notFound("No se encontró el grupo."));
        ClassPeriod period = periodRepository.findById(periodId)
            .orElseThrow(() -> ApiException.badRequest("Selecciona una hora válida."));

        LocalDate date;
        try {
            date = LocalDate.parse(dateStr);
        } catch (Exception e) {
            throw ApiException.badRequest("La fecha no es válida.");
        }

        CoverAssignment assignment = new CoverAssignment();
        assignment.setId("work-" + UUID.randomUUID());
        assignment.setTitle(title == null ? "" : title.trim());
        assignment.setDate(date);
        assignment.setWeekday(weekdayFrom(date));
        assignment.setGroup(group);
        assignment.setPeriod(period);
        assignment.setSubject(subject != null && !subject.isBlank() ? subject : group.getName());
        assignment.setAbsentTeacherName(absentTeacherName);
        assignment.setInstructions(instructions);
        assignment.setFileName(file.getOriginalFilename());
        assignment.setFileType(fileType);
        assignment.setFileContentType(file.getContentType());
        try {
            assignment.setFileData(file.getBytes());
        } catch (IOException e) {
            throw ApiException.badRequest("No se pudo leer el archivo adjunto.");
        }
        assignment.setCreatedAt(Instant.now());

        coverAssignmentRepository.save(assignment);
        return Mappers.coverAssignment(assignment);
    }

    public CoverAssignment requireCoverFile(String id) {
        return coverAssignmentRepository.findById(id)
            .orElseThrow(() -> ApiException.notFound("No se encontró el archivo del trabajo."));
    }

    private Weekday weekdayFrom(LocalDate date) {
        DayOfWeek dow = date.getDayOfWeek();
        return switch (dow) {
            case MONDAY -> Weekday.MONDAY;
            case TUESDAY -> Weekday.TUESDAY;
            case WEDNESDAY -> Weekday.WEDNESDAY;
            case THURSDAY -> Weekday.THURSDAY;
            case FRIDAY -> Weekday.FRIDAY;
            default -> Weekday.MONDAY;
        };
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }
}
