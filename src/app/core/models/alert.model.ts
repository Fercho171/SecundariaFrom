export type AlertLevel = 'ATTENTION' | 'ALERT' | 'RISK';

export interface AlertStudent {
  studentId: string;
  studentName: string;
  groupName: string;
  absences: number;
  attendancePercentage: number;
  level: AlertLevel;
}

export function alertLevelFromAbsences(absences: number): AlertLevel | null {
  if (absences >= 8) {
    return 'RISK';
  }
  if (absences >= 5) {
    return 'ALERT';
  }
  if (absences >= 3) {
    return 'ATTENTION';
  }
  return null;
}
