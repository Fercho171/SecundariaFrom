import { Pipe, PipeTransform } from '@angular/core';
import { AttendanceStatus } from '../../core/models';

const LABELS: Record<AttendanceStatus, string> = {
  PRESENT: 'Presente',
  ABSENT: 'Falta',
  JUSTIFIED: 'Justificada',
  LATE: 'Retardo'
};

@Pipe({ name: 'attendanceStatus' })
export class AttendanceStatusPipe implements PipeTransform {
  transform(value: AttendanceStatus | string | null | undefined): string {
    if (!value) {
      return '';
    }
    return LABELS[value as AttendanceStatus] ?? value;
  }
}
