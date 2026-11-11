export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'JUSTIFIED' | 'LATE';

export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  'PRESENT',
  'ABSENT',
  'JUSTIFIED',
  'LATE'
];

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  groupId: string;
  groupName: string;
  date: string;
  status: AttendanceStatus;
  teacherId: string;
  teacherName: string;
  recordedAt: string;
}

export interface AttendanceRecordInput {
  studentId: string;
  status: AttendanceStatus;
}

export interface AttendanceBatchRequest {
  groupId: string;
  date: string;
  records: AttendanceRecordInput[];
}

export interface AttendanceSummary {
  groupId: string;
  groupName: string;
  date: string;
  total: number;
  presents: number;
  absences: number;
  justified: number;
  lates: number;
  unmarked: number;
  percentage: number;
}

export interface AttendanceFilters {
  studentId?: string;
  groupId?: string;
  from?: string;
  to?: string;
  status?: AttendanceStatus | '';
  date?: string;
}
