import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { forkJoin } from 'rxjs';
import { AttendanceService } from '../../../core/services/attendance.service';
import { GroupService } from '../../../core/services/group.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConnectivityService } from '../../../core/services/connectivity.service';
import { OfflineQueueService } from '../../../core/services/offline-queue.service';
import { AttendanceStatus, Group, Student } from '../../../core/models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

interface StatusOption {
  value: AttendanceStatus;
  label: string;
  short: string;
}

@Component({
  selector: 'app-attendance-take',
  imports: [
    FormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule
  ],
  templateUrl: './attendance-take.component.html',
  styleUrl: './attendance-take.component.scss'
})
export class AttendanceTakeComponent {
  readonly groupId = input.required<string>();
  private readonly groupService = inject(GroupService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly notifications = inject(NotificationService);
  private readonly connectivity = inject(ConnectivityService);
  private readonly offlineQueue = inject(OfflineQueueService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly existing = signal(false);
  readonly group = signal<Group | null>(null);
  readonly students = signal<Student[]>([]);
  readonly statuses = signal<Record<string, AttendanceStatus | null>>({});
  readonly selectedDate = signal(new Date());

  readonly options: StatusOption[] = [
    { value: 'PRESENT', label: 'Presente', short: '✓' },
    { value: 'ABSENT', label: 'Falta', short: 'F' },
    { value: 'JUSTIFIED', label: 'Justificada', short: 'J' },
    { value: 'LATE', label: 'Retardo', short: 'R' }
  ];

  readonly summary = computed(() => {
    const values = Object.values(this.statuses());
    const total = this.students().length;
    const presents = values.filter((value) => value === 'PRESENT').length;
    const absences = values.filter((value) => value === 'ABSENT').length;
    const justified = values.filter((value) => value === 'JUSTIFIED').length;
    const lates = values.filter((value) => value === 'LATE').length;
    const unmarked = values.filter((value) => !value).length + Math.max(total - values.length, 0);
    return { total, presents, absences, justified, lates, unmarked };
  });

  constructor() {
    effect(() => {
      const groupId = this.groupId();
      const date = this.toIso(this.selectedDate());
      untracked(() => this.load(groupId, date));
    });
  }

  setStatus(studentId: string, status: AttendanceStatus): void {
    this.statuses.update((current) => ({ ...current, [studentId]: status }));
  }

  markAllPresent(): void {
    const next: Record<string, AttendanceStatus> = {};
    for (const student of this.students()) {
      next[student.id] = 'PRESENT';
    }
    this.statuses.set(next);
  }

  onDateChange(date: Date | null): void {
    if (date) {
      this.selectedDate.set(date);
    }
  }

  save(): void {
    const summary = this.summary();
    if (summary.unmarked > 0) {
      this.notifications.error('No se puede guardar una lista incompleta. Marca a todos los alumnos.');
      return;
    }
    const group = this.group();
    if (!group) {
      return;
    }

    this.dialog
      .open(ConfirmDialogComponent, {
        width: '480px',
        data: {
          title: 'Confirmar asistencia',
          message: 'Se guardará la lista de hoy. Verifica el resumen antes de continuar.',
          confirmText: 'Guardar asistencia',
          details: [
            { label: 'Grupo', value: group.name },
            { label: 'Total', value: summary.total },
            { label: 'Presentes', value: summary.presents },
            { label: 'Faltas', value: summary.absences },
            { label: 'Justificadas', value: summary.justified },
            { label: 'Retardos', value: summary.lates }
          ]
        }
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.persist();
      });
  }

  private persist(): void {
    const group = this.group();
    if (!group) {
      return;
    }
    const request = {
      groupId: group.id,
      date: this.toIso(this.selectedDate()),
      records: this.students().map((student) => ({
        studentId: student.id,
        status: this.statuses()[student.id]!
      }))
    };

    if (this.connectivity.offline()) {
      this.offlineQueue.enqueueAttendance(request);
      this.saving.set(false);
      this.notifications.info('Sin conexión. La lista quedó guardada localmente para sincronizar después.');
      return;
    }

    this.saving.set(true);
    this.attendanceService.saveBatch(request).subscribe({
      next: () => {
        this.saving.set(false);
        this.existing.set(true);
        this.notifications.success('Asistencia guardada correctamente.');
      },
      error: () => this.saving.set(false)
    });
  }

  private load(groupId: string, date: string): void {
    this.loading.set(true);
    forkJoin({
      group: this.groupService.getGroupById(groupId),
      students: this.groupService.getGroupStudents(groupId),
      attendance: this.attendanceService.getByGroup(groupId, date)
    }).subscribe({
      next: ({ group, students, attendance }) => {
        this.group.set(group);
        this.students.set(students);
        const map: Record<string, AttendanceStatus | null> = {};
        for (const student of students) {
          map[student.id] = attendance.find((item) => item.studentId === student.id)?.status ?? null;
        }
        this.statuses.set(map);
        this.existing.set(attendance.length > 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private toIso(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
