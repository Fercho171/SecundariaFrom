export type StudentStatus = 'ACTIVE' | 'INACTIVE';

export interface Student {
  id: string;
  studentNumber: number;
  firstName: string;
  lastName: string;
  fullName: string;
  groupId: string;
  groupName: string;
  status: StudentStatus;
  attendancePercentage: number;
  absences: number;
  lates: number;
  justified: number;
  presents: number;
  schoolYear: string;
}

export interface StudentProfile extends Student {
  monthlyAttendance: MonthlyAttendancePoint[];
  history: StudentAttendanceDay[];
}

export interface MonthlyAttendancePoint {
  month: string;
  monthLabel: string;
  percentage: number;
  presents: number;
  absences: number;
  justified: number;
  lates: number;
}

export interface StudentAttendanceDay {
  date: string;
  status: import('./attendance.model').AttendanceStatus;
  teacherName: string;
}
