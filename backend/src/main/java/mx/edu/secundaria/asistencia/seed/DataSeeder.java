package mx.edu.secundaria.asistencia.seed;

import mx.edu.secundaria.asistencia.config.AppProperties;
import mx.edu.secundaria.asistencia.model.*;
import mx.edu.secundaria.asistencia.repository.*;
import mx.edu.secundaria.asistencia.util.HashUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.*;

/**
 * Carga datos iniciales realistas la primera vez que arranca el backend contra una base vacía,
 * replicando el generador de datos de mock-store.ts del frontend (misma escuela, mismos docentes,
 * grupos, horarios y ~60 días de historial de asistencia) pero persistido en PostgreSQL.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final ZoneId ZONE = ZoneId.of("America/Mexico_City");

    private static final String[] FIRST_NAMES = {
        "Ana", "Luis", "María", "Carlos", "Sofía", "Diego", "Valeria", "José", "Fernanda", "Miguel",
        "Camila", "Juan", "Renata", "Pedro", "Daniela", "Andrés", "Paola", "Ricardo", "Ximena", "Héctor",
        "Alejandra", "Emiliano", "Natalia", "Gabriel", "Regina", "Santiago", "Isabella", "Eduardo"
    };

    private static final String[] LAST_NAMES = {
        "García", "Hernández", "Martínez", "López", "González", "Pérez", "Sánchez", "Ramírez",
        "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Cruz", "Morales", "Reyes", "Gutiérrez", "Ortiz"
    };

    private final TeacherRepository teacherRepository;
    private final GroupRepository groupRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final JustificationRepository justificationRepository;
    private final ClassPeriodRepository periodRepository;
    private final ScheduleSlotRepository slotRepository;
    private final TeacherAbsenceRepository absenceRepository;
    private final CoverAssignmentRepository coverAssignmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;

    @Value("${app.seed-data:true}")
    private boolean seedEnabled;

    public DataSeeder(
        TeacherRepository teacherRepository, GroupRepository groupRepository, StudentRepository studentRepository,
        AttendanceRepository attendanceRepository, JustificationRepository justificationRepository,
        ClassPeriodRepository periodRepository, ScheduleSlotRepository slotRepository,
        TeacherAbsenceRepository absenceRepository, CoverAssignmentRepository coverAssignmentRepository,
        UserRepository userRepository, PasswordEncoder passwordEncoder, AppProperties appProperties
    ) {
        this.teacherRepository = teacherRepository;
        this.groupRepository = groupRepository;
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.justificationRepository = justificationRepository;
        this.periodRepository = periodRepository;
        this.slotRepository = slotRepository;
        this.absenceRepository = absenceRepository;
        this.coverAssignmentRepository = coverAssignmentRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.appProperties = appProperties;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("Carga de datos semilla desactivada (app.seed-data=false).");
            return;
        }
        if (teacherRepository.count() > 0) {
            ensureAdminUser(teacherRepository.findById("t4").orElse(null));
            log.info("La base de datos ya tiene información; se omite la carga de datos semilla.");
            return;
        }

        log.info("Base de datos vacía detectada: cargando datos semilla de '{}'...", appProperties.nombre());

        Map<String, Teacher> teachers = seedTeachers();
        seedDemoUser(teachers.get("t4"));
        List<ClassPeriod> periods = seedPeriods();
        Map<String, Group> groups = seedGroups(teachers);
        List<Student> students = seedStudents(groups);
        seedAttendanceHistory(students, groups);
        seedSchedules(teachers, groups, periods);
        seedTeacherAbsences(teachers);
        seedCoverAssignments(groups, periods);

        log.info(
            "Datos semilla listos: {} docentes, {} grupos, {} alumnos.",
            teachers.size(), groups.size(), students.size()
        );
    }

    private Map<String, Teacher> seedTeachers() {
        record Seed(String id, String first, String last, String email, String groupId, String subject, int hours) {
        }
        List<Seed> seeds = List.of(
            new Seed("t1", "María Elena", "López Ruiz", "mlopez@secundaria.edu.mx", "g-1A", "Español", 25),
            new Seed("t2", "José Luis", "Hernández Soto", "jhernandez@secundaria.edu.mx", "g-1B", "Matemáticas", 25),
            new Seed("t3", "Patricia", "Ramírez Vega", "pramirez@secundaria.edu.mx", "g-1C", "Historia", 20),
            new Seed("t4", "Fernando", "Solorio Ortega", "fsolorio@secundaria.edu.mx", "g-2A", "Matemáticas", 30),
            new Seed("t5", "Claudia", "Sánchez Ortiz", "csanchez@secundaria.edu.mx", "g-2B", "Ciencias", 25),
            new Seed("t6", "Roberto", "Gómez Díaz", "rgomez@secundaria.edu.mx", "g-2C", "Inglés", 20),
            new Seed("t7", "Lucía", "Torres Nava", "ltorres@secundaria.edu.mx", "g-3A", "Formación Cívica", 20),
            new Seed("t8", "Miguel Ángel", "Cruz León", "mcruz@secundaria.edu.mx", "g-3B", "Educación Física", 20),
            new Seed("t9", "Adriana", "Flores Cano", "aflores@secundaria.edu.mx", "g-3C", "Artes", 20)
        );

        Map<String, Teacher> byId = new LinkedHashMap<>();
        for (Seed s : seeds) {
            Teacher teacher = new Teacher();
            teacher.setId(s.id());
            teacher.setFirstName(s.first());
            teacher.setLastName(s.last());
            teacher.setFullName(s.first() + " " + s.last());
            teacher.setEmail(s.email());
            teacher.setSubject(s.subject());
            teacher.setContractedHours(s.hours());
            byId.put(s.id(), teacher);
        }
        teacherRepository.saveAll(byId.values());
        // groupId por docente lo usamos luego al crear los grupos.
        this.teacherGroupId = seeds.stream().collect(java.util.stream.Collectors.toMap(Seed::id, Seed::groupId));
        return byId;
    }

    private Map<String, String> teacherGroupId = Map.of();

    private void seedDemoUser(Teacher fernando) {
        ensureAdminUser(fernando);
    }

    private void ensureAdminUser(Teacher teacher) {
        User user = userRepository.findByUsernameIgnoreCase("admin").orElseGet(() -> {
            User created = new User();
            created.setId("u-admin");
            return created;
        });
        user.setUsername("admin");
        user.setEmail("admin@secundaria.edu.mx");
        user.setFullName(teacher != null ? teacher.getFullName() : "Administrador");
        user.setPasswordHash(passwordEncoder.encode("admin"));
        user.setRole(UserRole.ADMIN);
        user.setTeacher(teacher);
        userRepository.save(user);
    }

    private List<ClassPeriod> seedPeriods() {
        List<ClassPeriod> periods = List.of(
            period(1, "1a", "07:00", "07:50"),
            period(2, "2a", "07:50", "08:40"),
            period(3, "3a", "08:40", "09:30"),
            period(4, "4a", "09:50", "10:40"),
            period(5, "5a", "10:40", "11:30"),
            period(6, "6a", "11:30", "12:20"),
            period(7, "7a", "12:20", "13:10")
        );
        periodRepository.saveAll(periods);
        return periods;
    }

    private ClassPeriod period(int id, String label, String start, String end) {
        ClassPeriod p = new ClassPeriod();
        p.setId(id);
        p.setLabel(label);
        p.setStartTime(start);
        p.setEndTime(end);
        return p;
    }

    private Map<String, Group> seedGroups(Map<String, Teacher> teachers) {
        Map<String, Group> groups = new LinkedHashMap<>();
        for (Map.Entry<String, String> entry : teacherGroupId.entrySet()) {
            String teacherId = entry.getKey();
            String groupId = entry.getValue();
            int grade = Character.getNumericValue(groupId.charAt(2));
            String letter = groupId.substring(3);

            Group group = new Group();
            group.setId(groupId);
            group.setGrade(grade);
            group.setLetter(letter);
            group.setName(grade + "° " + letter);
            group.setStudentCount(28);
            group.setTeacher(teachers.get(teacherId));
            group.setSchoolYear(appProperties.cicloEscolar());
            groups.put(groupId, group);
        }
        groupRepository.saveAll(groups.values());
        return groups;
    }

    private List<Student> seedStudents(Map<String, Group> groups) {
        List<Student> students = new ArrayList<>();
        int studentNumber = 1;
        int studentIndex = 0;

        // Mismo orden que el frontend: grado 1..3, letras A, B, C.
        List<String> orderedGroupIds = List.of("g-1A", "g-1B", "g-1C", "g-2A", "g-2B", "g-2C", "g-3A", "g-3B", "g-3C");
        for (String groupId : orderedGroupIds) {
            Group group = groups.get(groupId);
            for (int i = 0; i < 28; i++) {
                String firstName = FIRST_NAMES[Math.floorMod(studentIndex + i, FIRST_NAMES.length)];
                String lastName = LAST_NAMES[Math.floorMod(studentIndex + i * 3, LAST_NAMES.length)]
                    + " " + LAST_NAMES[Math.floorMod(studentIndex + i * 5, LAST_NAMES.length)];

                Student student = new Student();
                student.setId("s-" + studentNumber);
                student.setStudentNumber(studentNumber);
                student.setFirstName(firstName);
                student.setLastName(lastName);
                student.setFullName(firstName + " " + lastName);
                student.setGroup(group);
                student.setStatus(StudentStatus.ACTIVE);
                student.setSchoolYear(appProperties.cicloEscolar());
                students.add(student);

                studentNumber += 1;
            }
            studentIndex += 7;
        }
        studentRepository.saveAll(students);
        return students;
    }

    private void seedAttendanceHistory(List<Student> students, Map<String, Group> groups) {
        LocalDate today = LocalDate.now();
        List<LocalDate> schoolDays = schoolDays(today.minusDays(60), today);
        List<Attendance> batch = new ArrayList<>();
        int nextId = 1;

        for (Student student : students) {
            Group group = student.getGroup();
            int numericId = Integer.parseInt(student.getId().replace("s-", ""));
            int extraAbsences = numericId % 23 == 0 ? 8
                : numericId % 17 == 0 ? 6
                : numericId % 11 == 0 ? 4
                : 0;
            int forcedAbsences = extraAbsences;

            for (LocalDate date : schoolDays) {
                AttendanceStatus status = AttendanceStatus.PRESENT;
                long roll = HashUtil.hash(student.getId() + "-" + date) % 100;
                if (forcedAbsences > 0 && roll < 40) {
                    status = AttendanceStatus.ABSENT;
                    forcedAbsences -= 1;
                } else if (roll < 4) {
                    status = AttendanceStatus.ABSENT;
                } else if (roll < 7) {
                    status = AttendanceStatus.LATE;
                } else if (roll < 10) {
                    status = AttendanceStatus.JUSTIFIED;
                }

                if (date.equals(today) && !"A".equals(group.getLetter())) {
                    // Deja el día de hoy sin pasar lista en los grupos B/C, igual que el mock,
                    // para poder probar el flujo de "pasar lista" en la app.
                    continue;
                }

                Attendance attendance = new Attendance();
                attendance.setId("att-" + (nextId++));
                attendance.setStudent(student);
                attendance.setGroup(group);
                attendance.setDate(date);
                attendance.setStatus(status);
                attendance.setTeacher(group.getTeacher());
                attendance.setRecordedAt(LocalDateTime.of(date, java.time.LocalTime.of(8, 10)).atZone(ZONE).toInstant());
                batch.add(attendance);
            }
        }
        attendanceRepository.saveAll(batch);

        List<Attendance> justifiedSample = batch.stream()
            .filter(a -> a.getStatus() == AttendanceStatus.JUSTIFIED)
            .limit(8)
            .toList();
        List<Justification> justifications = new ArrayList<>();
        int jId = 1;
        for (Attendance record : justifiedSample) {
            Justification justification = new Justification();
            justification.setId("jus-" + (jId++));
            justification.setStudent(record.getStudent());
            justification.setDate(record.getDate());
            justification.setReason(JustificationReason.ILLNESS);
            justification.setNotes("Justificante cargado por control escolar.");
            justification.setCreatedAt(
                LocalDateTime.of(record.getDate(), java.time.LocalTime.NOON).atZone(ZONE).toInstant()
            );
            justifications.add(justification);
        }
        justificationRepository.saveAll(justifications);
    }

    private void seedSchedules(Map<String, Teacher> teachers, Map<String, Group> groups, List<ClassPeriod> periods) {
        List<Weekday> weekdays = List.of(Weekday.MONDAY, Weekday.TUESDAY, Weekday.WEDNESDAY, Weekday.THURSDAY, Weekday.FRIDAY);
        List<ScheduleSlot> slots = new ArrayList<>();
        int slotId = 1;

        for (Group group : groups.values()) {
            Teacher teacher = group.getTeacher();
            for (Weekday weekday : weekdays) {
                for (ClassPeriod period : periods) {
                    boolean skip = HashUtil.hash(group.getId() + "-" + weekday + "-" + period.getId()) % 11 == 0;
                    if (skip) {
                        continue;
                    }
                    ScheduleSlot slot = new ScheduleSlot();
                    slot.setId("slot-" + (slotId++));
                    slot.setTeacher(teacher);
                    slot.setGroup(group);
                    slot.setSubject(teacher.getSubject());
                    slot.setWeekday(weekday);
                    slot.setPeriod(period);
                    slot.setClassroom("Aula " + group.getGrade() + group.getLetter());
                    slots.add(slot);
                }
            }
        }

        // Fernando Solorio también imparte apoyo en 2° B los martes y jueves (igual que el mock).
        Teacher fernando = teachers.get("t4");
        Group grupo2B = groups.get("g-2B");
        ClassPeriod period6 = periods.stream().filter(p -> p.getId() == 6).findFirst().orElseThrow();
        for (Weekday weekday : List.of(Weekday.TUESDAY, Weekday.THURSDAY)) {
            ScheduleSlot slot = new ScheduleSlot();
            slot.setId("slot-" + (slotId++));
            slot.setTeacher(fernando);
            slot.setGroup(grupo2B);
            slot.setSubject("Matemáticas");
            slot.setWeekday(weekday);
            slot.setPeriod(period6);
            slot.setClassroom("Aula 2B");
            slots.add(slot);
        }

        slotRepository.saveAll(slots);
    }

    private void seedTeacherAbsences(Map<String, Teacher> teachers) {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate twoDaysAgo = today.minusDays(2);

        record Seed(String teacherId, LocalDate date, String reason, String coveredBy, List<Integer> periods) {
        }
        List<Seed> seeds = List.of(
            new Seed("t2", today, "Cita médica", "Patricia Ramírez Vega", List.of(1, 2, 3)),
            new Seed("t6", today, "Permiso personal", null, List.of(4, 5)),
            new Seed("t8", yesterday, "Incapacidad", "Lucía Torres Nava", List.of(2, 3, 4, 5)),
            new Seed("t3", twoDaysAgo, "Comisión escolar", null, List.of(1, 2))
        );

        List<TeacherAbsence> absences = new ArrayList<>();
        int id = 1;
        for (Seed s : seeds) {
            Teacher teacher = teachers.get(s.teacherId());
            Weekday weekday = Weekday.fromDayOfWeek(s.date().getDayOfWeek());
            List<String> affectedGroups = slotRepository.findByTeacherId(teacher.getId()).stream()
                .filter(slot -> slot.getWeekday() == weekday && s.periods().contains(slot.getPeriod().getId()))
                .map(slot -> slot.getGroup().getName())
                .distinct()
                .toList();

            TeacherAbsence absence = new TeacherAbsence();
            absence.setId("tabs-" + (id++));
            absence.setTeacher(teacher);
            absence.setDate(s.date());
            absence.setWeekday(weekday);
            absence.setReason(s.reason());
            absence.setCoveredBy(s.coveredBy());
            absence.setAffectedPeriods(new ArrayList<>(s.periods()));
            absence.setAffectedGroups(new ArrayList<>(affectedGroups));
            absences.add(absence);
        }
        absenceRepository.saveAll(absences);
    }

    private void seedCoverAssignments(Map<String, Group> groups, List<ClassPeriod> periods) {
        Group group = groups.get("g-2C");
        ClassPeriod period4 = periods.stream().filter(p -> p.getId() == 4).findFirst().orElseThrow();
        ClassPeriod period5 = periods.stream().filter(p -> p.getId() == 5).findFirst().orElseThrow();
        LocalDate today = LocalDate.now();
        Instant now = Instant.now();

        CoverAssignment a1 = new CoverAssignment();
        a1.setId("work-1");
        a1.setTitle("Guía de vocabulario en inglés");
        a1.setDate(today);
        a1.setWeekday(Weekday.fromDayOfWeek(today.getDayOfWeek()));
        a1.setGroup(group);
        a1.setPeriod(period4);
        a1.setSubject("Inglés");
        a1.setAbsentTeacherName("Roberto Gómez Díaz");
        a1.setInstructions("Trabajo para cubrir la hora sin maestro. Entregar al finalizar la clase.");
        a1.setFileName("guia-ingles-2c.pdf");
        a1.setFileType(CoverFileType.PDF);
        a1.setFileContentType("application/pdf");
        a1.setFileData("Guía de trabajo para 2° C. Complete the vocabulary exercises.".getBytes());
        a1.setCreatedAt(now);

        CoverAssignment a2 = new CoverAssignment();
        a2.setId("work-2");
        a2.setTitle("Ejercicios de lectura");
        a2.setDate(today);
        a2.setWeekday(Weekday.fromDayOfWeek(today.getDayOfWeek()));
        a2.setGroup(group);
        a2.setPeriod(period5);
        a2.setSubject("Inglés");
        a2.setAbsentTeacherName("Roberto Gómez Díaz");
        a2.setInstructions("Trabajo para cubrir la hora sin maestro. Entregar al finalizar la clase.");
        a2.setFileName("ejercicios-ingles-2c.docx");
        a2.setFileType(CoverFileType.WORD);
        a2.setFileContentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        a2.setFileData("Lee el texto y responde las preguntas.".getBytes());
        a2.setCreatedAt(now);

        coverAssignmentRepository.saveAll(List.of(a1, a2));
    }

    private List<LocalDate> schoolDays(LocalDate from, LocalDate to) {
        List<LocalDate> days = new ArrayList<>();
        for (LocalDate cursor = from; !cursor.isAfter(to); cursor = cursor.plusDays(1)) {
            var dow = cursor.getDayOfWeek();
            if (dow != java.time.DayOfWeek.SATURDAY && dow != java.time.DayOfWeek.SUNDAY) {
                days.add(cursor);
            }
        }
        return days;
    }
}
