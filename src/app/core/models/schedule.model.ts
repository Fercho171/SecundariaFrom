export type Weekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';

export const WEEKDAYS: { value: Weekday; label: string; short: string }[] = [
  { value: 'MONDAY', label: 'Lunes', short: 'Lun' },
  { value: 'TUESDAY', label: 'Martes', short: 'Mar' },
  { value: 'WEDNESDAY', label: 'Miércoles', short: 'Mié' },
  { value: 'THURSDAY', label: 'Jueves', short: 'Jue' },
  { value: 'FRIDAY', label: 'Viernes', short: 'Vie' }
];

export interface ClassPeriod {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
}

export interface ScheduleSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  groupId: string;
  groupName: string;
  subject: string;
  weekday: Weekday;
  periodId: number;
  classroom: string;
}

export interface TeacherAbsence {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string;
  weekday: Weekday;
  reason: string;
  coveredBy?: string;
  affectedPeriods: number[];
  affectedGroups: string[];
}

export interface TeacherWorkHours {
  teacherId: string;
  teacherName: string;
  subject: string;
  contractedHours: number;
  weeklyClassHours: number;
  dailyAverageHours: number;
  absencesThisMonth: number;
  workedHoursThisWeek: number;
}

export interface TeacherScheduleView {
  teacherId: string;
  teacherName: string;
  subject: string;
  email: string;
  groupNames: string[];
  slots: ScheduleSlot[];
  weeklyHours: number;
}

export type CoverFileType = 'PDF' | 'IMAGE' | 'WORD' | 'EXCEL';

export const COVER_FILE_ACCEPT =
  '.pdf,application/pdf,image/*,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export interface CoverAssignment {
  id: string;
  title: string;
  date: string;
  weekday: Weekday;
  groupId: string;
  groupName: string;
  periodId: number;
  periodLabel: string;
  subject: string;
  absentTeacherName: string;
  instructions: string;
  fileName: string;
  fileType: CoverFileType;
  createdAt: string;
}

export interface CoverAssignmentRequest {
  title: string;
  date: string;
  groupId: string;
  periodId: number;
  absentTeacherName: string;
  subject: string;
  instructions: string;
  file: File;
}

export interface UncoveredHour {
  date: string;
  weekday: Weekday;
  groupId: string;
  groupName: string;
  periodId: number;
  periodLabel: string;
  subject: string;
  absentTeacherName: string;
  reason: string;
  hasWork: boolean;
}

export function coverFileTypeFromName(fileName: string): CoverFileType | null {
  const name = fileName.toLowerCase();
  if (name.endsWith('.pdf')) return 'PDF';
  if (/\.(png|jpe?g|gif|webp|heic)$/.test(name)) return 'IMAGE';
  if (/\.(doc|docx)$/.test(name)) return 'WORD';
  if (/\.(xls|xlsx)$/.test(name)) return 'EXCEL';
  return null;
}

