import { Component, input } from '@angular/core';
import { AttendanceStatus } from '../../../core/models';
import { AttendanceStatusPipe } from '../../pipes/attendance-status.pipe';

@Component({
  selector: 'app-status-badge',
  imports: [AttendanceStatusPipe],
  template: `
    <span class="badge" [attr.data-status]="status()">
      {{ status() | attendanceStatus }}
    </span>
  `,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 0 0.7rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .badge[data-status='PRESENT'] { background: #e8f5e9; color: #1b5e20; }
    .badge[data-status='ABSENT'] { background: #fdecea; color: #b71c1c; }
    .badge[data-status='JUSTIFIED'] { background: #e8f1fb; color: #0d47a1; }
    .badge[data-status='LATE'] { background: #fff4e5; color: #e65100; }
  `
})
export class StatusBadgeComponent {
  readonly status = input.required<AttendanceStatus>();
}
