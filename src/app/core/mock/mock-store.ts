import { Injectable } from '@angular/core';
import {
  AlertStudent,
  Attendance,
  AttendanceBatchRequest,
  AttendanceFilters,
  AttendanceReport,
  AttendanceStatus,
  AttendanceSummary,
  ClassPeriod,
  CoverAssignment,
  CoverAssignmentRequest,
  coverFileTypeFromName,
  Dashboard,
  Group,
  Justification,
  JustificationReason,
  JUSTIFICATION_REASONS,
  LoginRequest,
  LoginResponse,
  ReportFilters,
  ScheduleSlot,
  Student,
  StudentProfile,
  Teacher,
  TeacherAbsence,
  TeacherScheduleView,
  TeacherWorkHours,
  UncoveredHour,
  User,
  Weekday,
  WEEKDAYS,
  alertLevelFromAbsences
} from '../models';
import { environment } from '../../../environments/environment';

const FIRST_NAMES = [
  'Ana', 'Luis', 'María', 'Carlos', 'Sofía', 'Diego', 'Valeria', 'José', 'Fernanda', 'Miguel',
  'Camila', 'Juan', 'Renata', 'Pedro', 'Daniela', 'Andrés', 'Paola', 'Ricardo', 'Ximena', 'Héctor',
  'Alejandra', 'Emiliano', 'Natalia', 'Gabriel', 'Regina', 'Santiago', 'Isabella', 'Eduardo'
];

const LAST_NAMES = [
  'García', 'Hernández', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez',
  'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes', 'Gutiérrez', 'Ortiz'
];

const TEACHERS: Teacher[] = [
  { id: 't1', firstName: 'María Elena', lastName: 'López Ruiz', fullName: 'María Elena López Ruiz', email: 'mlopez@secundaria.edu.mx', groupIds: ['g-1A'], subject: 'Español', contractedHours: 25 },
  { id: 't2', firstName: 'José Luis', lastName: 'Hernández Soto', fullName: 'José Luis Hernández Soto', email: 'jhernandez@secundaria.edu.mx', groupIds: ['g-1B'], subject: 'Matemáticas', contractedHours: 25 },
  { id: 't3', firstName: 'Patricia', lastName: 'Ramírez Vega', fullName: 'Patricia Ramírez Vega', email: 'pramirez@secundaria.edu.mx', groupIds: ['g-1C'], subject: 'Historia', contractedHours: 20 },
  { id: 't4', firstName: 'Fernando', lastName: 'Solorio Ortega', fullName: 'Fernando Solorio Ortega', email: 'fsolorio@secundaria.edu.mx', groupIds: ['g-2A'], subject: 'Matemáticas', contractedHours: 30 },
  { id: 't5', firstName: 'Claudia', lastName: 'Sánchez Ortiz', fullName: 'Claudia Sánchez Ortiz', email: 'csanchez@secundaria.edu.mx', groupIds: ['g-2B'], subject: 'Ciencias', contractedHours: 25 },
  { id: 't6', firstName: 'Roberto', lastName: 'Gómez Díaz', fullName: 'Roberto Gómez Díaz', email: 'rgomez@secundaria.edu.mx', groupIds: ['g-2C'], subject: 'Inglés', contractedHours: 20 },
  { id: 't7', firstName: 'Lucía', lastName: 'Torres Nava', fullName: 'Lucía Torres Nava', email: 'ltorres@secundaria.edu.mx', groupIds: ['g-3A'], subject: 'Formación Cívica', contractedHours: 20 },
  { id: 't8', firstName: 'Miguel Ángel', lastName: 'Cruz León', fullName: 'Miguel Ángel Cruz León', email: 'mcruz@secundaria.edu.mx', groupIds: ['g-3B'], subject: 'Educación Física', contractedHours: 20 },
  { id: 't9', firstName: 'Adriana', lastName: 'Flores Cano', fullName: 'Adriana Flores Cano', email: 'aflores@secundaria.edu.mx', groupIds: ['g-3C'], subject: 'Artes', contractedHours: 20 }
];

const DEMO_USER: User = {
  id: 'u-admin',
  username: 'admin',
  email: 'admin@secundaria.edu.mx',
  fullName: 'Fernando Solorio Ortega',
  role: 'ADMIN',
  teacherId: 't4'
};

const CLASS_PERIODS: ClassPeriod[] = [
  { id: 1, label: '1a', startTime: '07:00', endTime: '07:50' },
  { id: 2, label: '2a', startTime: '07:50', endTime: '08:40' },
  { id: 3, label: '3a', startTime: '08:40', endTime: '09:30' },
  { id: 4, label: '4a', startTime: '09:50', endTime: '10:40' },
  { id: 5, label: '5a', startTime: '10:40', endTime: '11:30' },
  { id: 6, label: '6a', startTime: '11:30', endTime: '12:20' },
  { id: 7, label: '7a', startTime: '12:20', endTime: '13:10' }
];

@Injectable({ providedIn: 'root' })
export class MockStore {
  readonly groups: Group[] = [];
  readonly students: Student[] = [];
  readonly teachers = TEACHERS;
  readonly periods = CLASS_PERIODS;
  attendances: Attendance[] = [];
  justifications: Justification[] = [];
  scheduleSlots: ScheduleSlot[] = [];
  teacherAbsences: TeacherAbsence[] = [];
  coverAssignments: CoverAssignment[] = [];
  private coverFiles = new Map<string, Blob>();

  private nextAttendanceId = 1;
  private nextJustificationId = 1;
  private nextCoverId = 1;
  private seeded = false;

  login(body: LoginRequest): LoginResponse {
    if (!body?.username || !body?.password) {
      throw { status: 400, message: 'Usuario y contraseña son obligatorios.' };
    }
    const username = String(body.username).trim().toLowerCase();
    const password = String(body.password);
    const validUser = username === 'admin' || username === DEMO_USER.email.toLowerCase();
    if (!validUser || password !== 'admin') {
      throw { status: 401, message: 'Usuario o contraseña incorrectos.' };
    }
    return {
      token: `mock-jwt-${Date.now()}`,
      user: { ...DEMO_USER }
    };
  }

  getGroups(): Group[] {
    this.ensureSeed();
    return this.groups;
  }

  getGroup(id: string): Group {
    this.ensureSeed();
    const group = this.groups.find((item) => item.id === id);
    if (!group) {
      throw { status: 404, message: 'No se encontró el grupo.' };
    }
    return group;
  }

  getGroupStudents(id: string): Student[] {
    this.getGroup(id);
    return this.students.filter((student) => student.groupId === id);
  }

  getStudents(search?: string, groupId?: string): Student[] {
    this.ensureSeed();
    return this.students.filter((student) => {
      const matchesGroup = !groupId || student.groupId === groupId;
      const term = search?.trim().toLowerCase() ?? '';
      const matchesSearch =
        !term ||
        student.fullName.toLowerCase().includes(term) ||
        String(student.studentNumber).includes(term);
      return matchesGroup && matchesSearch;
    });
  }

  getStudent(id: string): StudentProfile {
    this.ensureSeed();
    const student = this.students.find((item) => item.id === id);
    if (!student) {
      throw { status: 404, message: 'No se encontró el alumno.' };
    }
    const history = this.attendances
      .filter((item) => item.studentId === id)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((item) => ({
        date: item.date,
        status: item.status,
        teacherName: item.teacherName
      }));
    return {
      ...student,
      history,
      monthlyAttendance: this.monthlyPoints(id)
    };
  }

  getAttendance(filters: AttendanceFilters): Attendance[] {
    this.ensureSeed();
    return this.attendances
      .filter((item) => {
        if (filters.studentId && item.studentId !== filters.studentId) return false;
        if (filters.groupId && item.groupId !== filters.groupId) return false;
        if (filters.status && item.status !== filters.status) return false;
        if (filters.date && item.date !== filters.date) return false;
        if (filters.from && item.date < filters.from) return false;
        if (filters.to && item.date > filters.to) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || a.studentName.localeCompare(b.studentName));
  }

  saveAttendance(request: AttendanceBatchRequest): Attendance[] {
    this.ensureSeed();
    const group = this.getGroup(request.groupId);
    const students = this.getGroupStudents(request.groupId);
    if (request.records.length !== students.length) {
      throw { status: 400, message: 'La lista está incompleta. Todos los alumnos deben tener un estado.' };
    }
    const missing = request.records.some((record) => !record.status || !record.studentId);
    if (missing) {
      throw { status: 400, message: 'La lista está incompleta. Todos los alumnos deben tener un estado.' };
    }

    const uniqueStudents = new Set(request.records.map((record) => record.studentId));
    if (uniqueStudents.size !== request.records.length) {
      throw { status: 409, message: 'Ya existe un registro de asistencia para este alumno.' };
    }

    this.attendances = this.attendances.filter(
      (item) => !(item.groupId === request.groupId && item.date === request.date)
    );

    const saved = request.records.map((record) => {
      const student = students.find((item) => item.id === record.studentId);
      const attendance: Attendance = {
        id: `att-${this.nextAttendanceId++}`,
        studentId: record.studentId,
        studentName: student?.fullName ?? '',
        groupId: group.id,
        groupName: group.name,
        date: request.date,
        status: record.status,
        teacherId: group.teacherId,
        teacherName: group.teacherName,
        recordedAt: new Date().toISOString()
      };
      return attendance;
    });

    this.attendances.push(...saved);
    this.refreshStudentStats();
    return saved;
  }

  updateAttendance(id: string, status: AttendanceStatus): Attendance {
    this.ensureSeed();
    const index = this.attendances.findIndex((item) => item.id === id);
    if (index < 0) {
      throw { status: 404, message: 'No se encontró el registro de asistencia.' };
    }
    this.attendances[index] = { ...this.attendances[index], status, recordedAt: new Date().toISOString() };
    this.refreshStudentStats();
    return this.attendances[index];
  }

  getJustifications(): Justification[] {
    this.ensureSeed();
    return [...this.justifications].sort((a, b) => b.date.localeCompare(a.date));
  }

  createJustification(input: {
    studentId: string;
    date: string;
    reason: JustificationReason;
    notes: string;
    fileName?: string;
  }): Justification {
    this.ensureSeed();
    const student = this.students.find((item) => item.id === input.studentId);
    if (!student) {
      throw { status: 404, message: 'No se encontró el alumno.' };
    }
    const reasonLabel = JUSTIFICATION_REASONS.find((item) => item.value === input.reason)?.label ?? input.reason;
    const justification: Justification = {
      id: `jus-${this.nextJustificationId++}`,
      studentId: student.id,
      studentName: student.fullName,
      groupName: student.groupName,
      date: input.date,
      reason: input.reason,
      reasonLabel,
      notes: input.notes,
      fileName: input.fileName,
      createdAt: new Date().toISOString()
    };
    this.justifications.unshift(justification);

    const existing = this.attendances.find(
      (item) => item.studentId === student.id && item.date === input.date
    );
    if (existing && existing.status === 'ABSENT') {
      existing.status = 'JUSTIFIED';
      this.refreshStudentStats();
    }
    return justification;
  }

  getDashboard(): Dashboard {
    this.ensureSeed();
    const today = this.today();
    const todayRecords = this.attendances.filter((item) => item.date === today);
    const groupAttendance = this.groups.map((group) => this.summaryFor(group.id, today));
    const counted = todayRecords.length;
    const presents = todayRecords.filter((item) => item.status === 'PRESENT').length;
    const absences = todayRecords.filter((item) => item.status === 'ABSENT').length;
    const justified = todayRecords.filter((item) => item.status === 'JUSTIFIED').length;
    const lates = todayRecords.filter((item) => item.status === 'LATE').length;

    return {
      totalStudents: this.students.length,
      totalGroups: this.groups.length,
      todayAttendancePercentage: counted
        ? round(((presents + lates + justified) / counted) * 100)
        : 0,
      todayPresents: presents,
      todayAbsences: absences,
      todayJustified: justified,
      todayLates: lates,
      pendingJustifications: this.justifications.length,
      alertStudents: this.getAlerts(),
      groupAttendance
    };
  }

  getAlerts(): AlertStudent[] {
    this.ensureSeed();
    return this.students
      .map((student) => {
        const level = alertLevelFromAbsences(student.absences);
        if (!level) {
          return null;
        }
        return {
          studentId: student.id,
          studentName: student.fullName,
          groupName: student.groupName,
          absences: student.absences,
          attendancePercentage: student.attendancePercentage,
          level
        } satisfies AlertStudent;
      })
      .filter((item): item is AlertStudent => item !== null)
      .sort((a, b) => b.absences - a.absences);
  }

  getPeriods(): ClassPeriod[] {
    return this.periods;
  }

  getTeachers(): Teacher[] {
    return [...this.teachers];
  }

  getClassSchedule(weekday?: Weekday, groupId?: string): ScheduleSlot[] {
    this.ensureSeed();
    return this.scheduleSlots
      .filter((slot) => (!weekday || slot.weekday === weekday) && (!groupId || slot.groupId === groupId))
      .sort((a, b) => a.periodId - b.periodId || a.groupName.localeCompare(b.groupName));
  }

  getTeacherSchedules(): TeacherScheduleView[] {
    this.ensureSeed();
    return this.teachers.map((teacher) => {
      const slots = this.scheduleSlots
        .filter((slot) => slot.teacherId === teacher.id)
        .sort((a, b) => WEEKDAYS.findIndex((d) => d.value === a.weekday) - WEEKDAYS.findIndex((d) => d.value === b.weekday) || a.periodId - b.periodId);
      return {
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        subject: teacher.subject,
        email: teacher.email,
        groupNames: teacher.groupIds.map((id) => this.groups.find((group) => group.id === id)?.name ?? id),
        slots,
        weeklyHours: slots.length
      };
    });
  }

  getTeacherSchedule(teacherId: string): TeacherScheduleView {
    const schedule = this.getTeacherSchedules().find((item) => item.teacherId === teacherId);
    if (!schedule) {
      throw { status: 404, message: 'No se encontró el horario del docente.' };
    }
    return schedule;
  }

  getTeacherAbsences(date?: string): TeacherAbsence[] {
    this.ensureSeed();
    const target = date ?? this.today();
    return this.teacherAbsences
      .filter((item) => item.date === target)
      .sort((a, b) => a.teacherName.localeCompare(b.teacherName));
  }

  getAllTeacherAbsences(): TeacherAbsence[] {
    this.ensureSeed();
    return [...this.teacherAbsences].sort((a, b) => b.date.localeCompare(a.date) || a.teacherName.localeCompare(b.teacherName));
  }

  getWorkHours(): TeacherWorkHours[] {
    this.ensureSeed();
    const monthPrefix = this.today().slice(0, 7);
    return this.teachers.map((teacher) => {
      const weeklyClassHours = this.scheduleSlots.filter((slot) => slot.teacherId === teacher.id).length;
      const absencesThisMonth = this.teacherAbsences.filter(
        (item) => item.teacherId === teacher.id && item.date.startsWith(monthPrefix)
      ).length;
      const absentToday = this.teacherAbsences.some(
        (item) => item.teacherId === teacher.id && item.date === this.today()
      );
      return {
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        subject: teacher.subject,
        contractedHours: teacher.contractedHours,
        weeklyClassHours,
        dailyAverageHours: Math.round((weeklyClassHours / 5) * 10) / 10,
        absencesThisMonth,
        workedHoursThisWeek: Math.max(weeklyClassHours - (absentToday ? 2 : 0), 0)
      };
    });
  }

  getUncoveredHours(date?: string): UncoveredHour[] {
    this.ensureSeed();
    const target = date ?? this.today();
    const hours: UncoveredHour[] = [];
    for (const absence of this.getTeacherAbsences(target)) {
      if (absence.coveredBy) {
        continue;
      }
      const periodIds = absence.affectedPeriods.length ? absence.affectedPeriods : this.periods.map((period) => period.id);
      for (const periodId of periodIds) {
        const period = this.periods.find((item) => item.id === periodId);
        const slots = this.scheduleSlots.filter(
          (slot) =>
            slot.teacherId === absence.teacherId &&
            slot.weekday === absence.weekday &&
            slot.periodId === periodId
        );
        const targets = slots.length
          ? slots
          : absence.affectedGroups.map((groupName) => {
              const group = this.groups.find((item) => item.name === groupName);
              return {
                groupId: group?.id ?? '',
                groupName,
                subject: this.teachers.find((teacher) => teacher.id === absence.teacherId)?.subject ?? '',
                periodId
              };
            });
        for (const targetSlot of targets) {
          const groupId = 'groupId' in targetSlot ? targetSlot.groupId : '';
          const groupName = 'groupName' in targetSlot ? targetSlot.groupName : '';
          const subject = 'subject' in targetSlot ? targetSlot.subject : '';
          hours.push({
            date: target,
            weekday: absence.weekday,
            groupId,
            groupName,
            periodId,
            periodLabel: period ? `${period.label} ${period.startTime}-${period.endTime}` : `${periodId}ª`,
            subject,
            absentTeacherName: absence.teacherName,
            reason: absence.reason,
            hasWork: this.coverAssignments.some(
              (item) => item.date === target && item.groupId === groupId && item.periodId === periodId
            )
          });
        }
      }
    }
    return hours.sort((a, b) => a.periodId - b.periodId || a.groupName.localeCompare(b.groupName));
  }

  getCoverAssignments(date?: string): CoverAssignment[] {
    this.ensureSeed();
    return this.coverAssignments
      .filter((item) => !date || item.date === date)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  createCoverAssignment(input: CoverAssignmentRequest): CoverAssignment {
    this.ensureSeed();
    const fileType = coverFileTypeFromName(input.file.name);
    if (!fileType) {
      throw { status: 400, message: 'Solo se permiten PDF, imágenes, Word o Excel.' };
    }
    const group = this.getGroup(input.groupId);
    const period = this.periods.find((item) => item.id === Number(input.periodId));
    if (!period) {
      throw { status: 400, message: 'Selecciona una hora válida.' };
    }
    const dateObj = new Date(`${input.date}T00:00:00`);
    const assignment: CoverAssignment = {
      id: `work-${this.nextCoverId++}`,
      title: input.title.trim(),
      date: input.date,
      weekday: this.weekdayFromDate(dateObj),
      groupId: group.id,
      groupName: group.name,
      periodId: period.id,
      periodLabel: `${period.label} ${period.startTime}-${period.endTime}`,
      subject: input.subject || group.name,
      absentTeacherName: input.absentTeacherName,
      instructions: input.instructions,
      fileName: input.file.name,
      fileType,
      createdAt: new Date().toISOString()
    };
    this.coverAssignments.unshift(assignment);
    this.coverFiles.set(assignment.id, input.file);
    return assignment;
  }

  downloadCoverFile(id: string): { blob: Blob; fileName: string } {
    this.ensureSeed();
    const assignment = this.coverAssignments.find((item) => item.id === id);
    const blob = this.coverFiles.get(id);
    if (!assignment || !blob) {
      throw { status: 404, message: 'No se encontró el archivo del trabajo.' };
    }
    return { blob, fileName: assignment.fileName };
  }

  getReport(filters: ReportFilters): AttendanceReport {
    this.ensureSeed();
    const today = this.today();
    const from = filters.from ?? (filters.type === 'DAILY' ? today : filters.month ? `${filters.month}-01` : this.shiftDays(today, -30));
    const to = filters.to ?? today;
    let rows: AttendanceReport['rows'] = [];

    if (filters.type === 'TOP_ABSENCES') {
      rows = [...this.students]
        .sort((a, b) => b.absences - a.absences)
        .slice(0, 20)
        .map((student) => ({
          studentName: student.fullName,
          groupName: student.groupName,
          absences: student.absences,
          percentage: student.attendancePercentage
        }));
    } else if (filters.type === 'BY_STUDENT' && filters.studentId) {
      rows = this.getAttendance({ studentId: filters.studentId, from, to }).map((item) => ({
        date: item.date,
        studentName: item.studentName,
        groupName: item.groupName,
        status: item.status,
        teacherName: item.teacherName
      }));
    } else {
      rows = this.getAttendance({
        groupId: filters.groupId,
        from,
        to
      }).map((item) => ({
        date: item.date,
        studentName: item.studentName,
        groupName: item.groupName,
        status: item.status,
        teacherName: item.teacherName
      }));
    }

    const statuses = rows.map((row) => row.status);
    const presents = statuses.filter((status) => status === 'PRESENT').length;
    const absences = statuses.filter((status) => status === 'ABSENT').length;
    const justified = statuses.filter((status) => status === 'JUSTIFIED').length;
    const lates = statuses.filter((status) => status === 'LATE').length;
    const total = rows.length || 1;

    return {
      type: filters.type,
      generatedAt: new Date().toISOString(),
      from,
      to,
      rows,
      summary: {
        total: rows.length,
        presents,
        absences,
        justified,
        lates,
        percentage: round(((presents + lates + justified) / total) * 100)
      }
    };
  }

  private summaryFor(groupId: string, date: string): AttendanceSummary {
    const group = this.getGroup(groupId);
    const records = this.attendances.filter((item) => item.groupId === groupId && item.date === date);
    const presents = records.filter((item) => item.status === 'PRESENT').length;
    const absences = records.filter((item) => item.status === 'ABSENT').length;
    const justified = records.filter((item) => item.status === 'JUSTIFIED').length;
    const lates = records.filter((item) => item.status === 'LATE').length;
    const total = group.studentCount;
    const marked = records.length;
    return {
      groupId,
      groupName: group.name,
      date,
      total,
      presents,
      absences,
      justified,
      lates,
      unmarked: Math.max(total - marked, 0),
      percentage: marked ? round(((presents + lates + justified) / marked) * 100) : 0
    };
  }

  private monthlyPoints(studentId: string) {
    const months = this.lastMonths(6);
    return months.map((month) => {
      const records = this.attendances.filter(
        (item) => item.studentId === studentId && item.date.startsWith(month)
      );
      const presents = records.filter((item) => item.status === 'PRESENT').length;
      const absences = records.filter((item) => item.status === 'ABSENT').length;
      const justified = records.filter((item) => item.status === 'JUSTIFIED').length;
      const lates = records.filter((item) => item.status === 'LATE').length;
      const total = records.length || 1;
      return {
        month,
        monthLabel: this.monthLabel(month),
        percentage: round(((presents + lates + justified) / total) * 100),
        presents,
        absences,
        justified,
        lates
      };
    });
  }

  private refreshStudentStats(): void {
    for (const student of this.students) {
      const records = this.attendances.filter((item) => item.studentId === student.id);
      student.presents = records.filter((item) => item.status === 'PRESENT').length;
      student.absences = records.filter((item) => item.status === 'ABSENT').length;
      student.justified = records.filter((item) => item.status === 'JUSTIFIED').length;
      student.lates = records.filter((item) => item.status === 'LATE').length;
      const total = records.length || 1;
      student.attendancePercentage = round(
        ((student.presents + student.lates + student.justified) / total) * 100
      );
    }
  }

  private ensureSeed(): void {
    if (this.seeded) {
      return;
    }
    // Marcar antes de generar datos para evitar reentrada durante el seed.
    this.seeded = true;
    try {
      this.seed();
    } catch (error) {
      this.seeded = false;
      this.groups.length = 0;
      this.students.length = 0;
      this.attendances = [];
      this.justifications = [];
      this.scheduleSlots = [];
      this.teacherAbsences = [];
      this.coverAssignments = [];
      this.coverFiles.clear();
      throw error;
    }
  }

  private seed(): void {
    const letters = ['A', 'B', 'C'];
    let studentNumber = 1;
    let studentIndex = 0;

    for (const grade of [1, 2, 3]) {
      for (const letter of letters) {
        const id = `g-${grade}${letter}`;
        const teacher = TEACHERS.find((item) => item.groupIds.includes(id));
        if (!teacher) {
          throw new Error(`No hay docente asignado para el grupo ${id}`);
        }
        this.groups.push({
          id,
          grade,
          letter,
          name: `${grade}° ${letter}`,
          studentCount: 28,
          teacherId: teacher.id,
          teacherName: teacher.fullName,
          schoolYear: environment.schoolYear
        });

        for (let i = 0; i < 28; i++) {
          const firstName = FIRST_NAMES[(studentIndex + i) % FIRST_NAMES.length];
          const lastName = `${LAST_NAMES[(studentIndex + i * 3) % LAST_NAMES.length]} ${LAST_NAMES[(studentIndex + i * 5) % LAST_NAMES.length]}`;
          this.students.push({
            id: `s-${studentNumber}`,
            studentNumber,
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            groupId: id,
            groupName: `${grade}° ${letter}`,
            status: 'ACTIVE',
            attendancePercentage: 100,
            absences: 0,
            lates: 0,
            justified: 0,
            presents: 0,
            schoolYear: environment.schoolYear
          });
          studentNumber += 1;
        }
        studentIndex += 7;
      }
    }

    const schoolDays = this.schoolDays(this.shiftDays(this.today(), -60), this.today());
    for (const student of this.students) {
      const group = this.groups.find((item) => item.id === student.groupId);
      if (!group) {
        continue;
      }
      const extraAbsences = Number(student.id.replace('s-', '')) % 23 === 0 ? 8
        : Number(student.id.replace('s-', '')) % 17 === 0 ? 6
        : Number(student.id.replace('s-', '')) % 11 === 0 ? 4
        : 0;

      let forcedAbsences = extraAbsences;
      for (const date of schoolDays) {
        let status: AttendanceStatus = 'PRESENT';
        const roll = hash(`${student.id}-${date}`) % 100;
        if (forcedAbsences > 0 && roll < 40) {
          status = 'ABSENT';
          forcedAbsences -= 1;
        } else if (roll < 4) {
          status = 'ABSENT';
        } else if (roll < 7) {
          status = 'LATE';
        } else if (roll < 10) {
          status = 'JUSTIFIED';
        }

        if (date === this.today() && group.letter !== 'A') {
          continue;
        }

        this.attendances.push({
          id: `att-${this.nextAttendanceId++}`,
          studentId: student.id,
          studentName: student.fullName,
          groupId: student.groupId,
          groupName: student.groupName,
          date,
          status,
          teacherId: group.teacherId,
          teacherName: group.teacherName,
          recordedAt: `${date}T08:10:00`
        });
      }
    }

    this.refreshStudentStats();

    const justifiedRecords = this.attendances.filter((item) => item.status === 'JUSTIFIED').slice(0, 8);
    for (const record of justifiedRecords) {
      this.justifications.push({
        id: `jus-${this.nextJustificationId++}`,
        studentId: record.studentId,
        studentName: record.studentName,
        groupName: record.groupName,
        date: record.date,
        reason: 'ILLNESS',
        reasonLabel: 'Enfermedad',
        notes: 'Justificante cargado por control escolar.',
        createdAt: `${record.date}T12:00:00`
      });
    }

    this.seedSchedules();
    this.seedTeacherAbsences();
    this.seedCoverAssignments();
  }

  private seedSchedules(): void {
    let slotId = 1;
    const weekdays = WEEKDAYS.map((day) => day.value);
    for (const group of this.groups) {
      const teacher = this.teachers.find((item) => item.groupIds.includes(group.id));
      if (!teacher) {
        continue;
      }
      for (const weekday of weekdays) {
        for (const period of this.periods) {
          // Cada grupo tiene clase con su docente titular en la mayoría de horas.
          const skip = hash(`${group.id}-${weekday}-${period.id}`) % 11 === 0;
          if (skip) {
            continue;
          }
          this.scheduleSlots.push({
            id: `slot-${slotId++}`,
            teacherId: teacher.id,
            teacherName: teacher.fullName,
            groupId: group.id,
            groupName: group.name,
            subject: teacher.subject,
            weekday,
            periodId: period.id,
            classroom: `Aula ${group.grade}${group.letter}`
          });
        }
      }
    }

    // Fernando Solorio también imparte apoyo en 2° B los martes y jueves.
    const fernando = this.teachers.find((item) => item.id === 't4')!;
    for (const weekday of ['TUESDAY', 'THURSDAY'] as Weekday[]) {
      this.scheduleSlots.push({
        id: `slot-${slotId++}`,
        teacherId: fernando.id,
        teacherName: fernando.fullName,
        groupId: 'g-2B',
        groupName: '2° B',
        subject: 'Matemáticas',
        weekday,
        periodId: 6,
        classroom: 'Aula 2B'
      });
    }
  }

  private seedTeacherAbsences(): void {
    const today = this.today();
    const yesterday = this.shiftDays(today, -1);
    const absences: Array<{
      teacherId: string;
      date: string;
      reason: string;
      coveredBy?: string;
      periods: number[];
    }> = [
      { teacherId: 't2', date: today, reason: 'Cita médica', coveredBy: 'Patricia Ramírez Vega', periods: [1, 2, 3] },
      { teacherId: 't6', date: today, reason: 'Permiso personal', periods: [4, 5] },
      { teacherId: 't8', date: yesterday, reason: 'Incapacidad', coveredBy: 'Lucía Torres Nava', periods: [2, 3, 4, 5] },
      { teacherId: 't3', date: this.shiftDays(today, -2), reason: 'Comisión escolar', periods: [1, 2] }
    ];

    absences.forEach((item, index) => {
      const teacher = this.teachers.find((entry) => entry.id === item.teacherId)!;
      const dateObj = new Date(`${item.date}T00:00:00`);
      const weekday = this.weekdayFromDate(dateObj);
      const affectedGroups = [...new Set(
        this.scheduleSlots
          .filter((slot) => slot.teacherId === item.teacherId && slot.weekday === weekday && item.periods.includes(slot.periodId))
          .map((slot) => slot.groupName)
      )];
      this.teacherAbsences.push({
        id: `tabs-${index + 1}`,
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        date: item.date,
        weekday,
        reason: item.reason,
        coveredBy: item.coveredBy,
        affectedPeriods: item.periods,
        affectedGroups
      });
    });
  }

  private seedCoverAssignments(): void {
    const today = this.today();
    const group = this.groups.find((item) => item.id === 'g-2C');
    const period4 = this.periods.find((item) => item.id === 4);
    const period5 = this.periods.find((item) => item.id === 5);
    if (!group || !period4 || !period5) {
      return;
    }
    const samples: Array<{ title: string; period: ClassPeriod; fileName: string; fileType: CoverAssignment['fileType']; content: string; type: string }> = [
      {
        title: 'Guía de vocabulario en inglés',
        period: period4,
        fileName: 'guia-ingles-2c.pdf',
        fileType: 'PDF',
        content: 'Guía de trabajo para 2° C. Complete the vocabulary exercises.',
        type: 'application/pdf'
      },
      {
        title: 'Ejercicios de lectura',
        period: period5,
        fileName: 'ejercicios-ingles-2c.docx',
        fileType: 'WORD',
        content: 'Lee el texto y responde las preguntas.',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    ];
    for (const sample of samples) {
      const assignment: CoverAssignment = {
        id: `work-${this.nextCoverId++}`,
        title: sample.title,
        date: today,
        weekday: this.weekdayFromDate(new Date(`${today}T00:00:00`)),
        groupId: group.id,
        groupName: group.name,
        periodId: sample.period.id,
        periodLabel: `${sample.period.label} ${sample.period.startTime}-${sample.period.endTime}`,
        subject: 'Inglés',
        absentTeacherName: 'Roberto Gómez Díaz',
        instructions: 'Trabajo para cubrir la hora sin maestro. Entregar al finalizar la clase.',
        fileName: sample.fileName,
        fileType: sample.fileType,
        createdAt: new Date().toISOString()
      };
      this.coverAssignments.push(assignment);
      this.coverFiles.set(assignment.id, new Blob([sample.content], { type: sample.type }));
    }
  }

  private weekdayFromDate(date: Date): Weekday {
    const map: Record<number, Weekday> = {
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY'
    };
    return map[date.getDay()] ?? 'MONDAY';
  }

  private lastMonths(count: number): string[] {
    const months: string[] = [];
    const date = new Date();
    date.setDate(1);
    for (let i = count - 1; i >= 0; i--) {
      const cursor = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const month = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      months.push(month);
    }
    return months;
  }

  private monthLabel(month: string): string {
    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthIndex = Number(month.split('-')[1]) - 1;
    return labels[monthIndex];
  }

  private schoolDays(from: string, to: string): string[] {
    const days: string[] = [];
    const cursor = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T00:00:00`);
    while (cursor <= end) {
      const weekday = cursor.getDay();
      if (weekday !== 0 && weekday !== 6) {
        days.push(toIsoDate(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }

  private today(): string {
    return toIsoDate(new Date());
  }

  private shiftDays(isoDate: string, amount: number): string {
    const date = new Date(`${isoDate}T00:00:00`);
    date.setDate(date.getDate() + amount);
    return toIsoDate(date);
  }
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function hash(value: string): number {
  let total = 0;
  for (let i = 0; i < value.length; i++) {
    total = (total * 31 + value.charCodeAt(i)) >>> 0;
  }
  return total;
}
