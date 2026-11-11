import { AlertStudent } from './alert.model';
import { AttendanceSummary } from './attendance.model';

export interface Dashboard {
  totalStudents: number;
  totalGroups: number;
  todayAttendancePercentage: number;
  todayPresents: number;
  todayAbsences: number;
  todayJustified: number;
  todayLates: number;
  pendingJustifications: number;
  alertStudents: AlertStudent[];
  groupAttendance: AttendanceSummary[];
}

export interface AttendanceReport {
  type: ReportType;
  generatedAt: string;
  from?: string;
  to?: string;
  rows: AttendanceReportRow[];
  summary: {
    total: number;
    presents: number;
    absences: number;
    justified: number;
    lates: number;
    percentage: number;
  };
}

export type ReportType =
  | 'DAILY'
  | 'MONTHLY'
  | 'BY_GROUP'
  | 'BY_STUDENT'
  | 'TOP_ABSENCES';

export interface AttendanceReportRow {
  date?: string;
  studentName: string;
  groupName: string;
  status?: string;
  absences?: number;
  percentage?: number;
  teacherName?: string;
}

export interface ReportFilters {
  type: ReportType;
  groupId?: string;
  studentId?: string;
  from?: string;
  to?: string;
  month?: string;
}
