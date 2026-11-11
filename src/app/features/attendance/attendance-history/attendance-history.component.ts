import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AttendanceService } from '../../../core/services/attendance.service';
import { GroupService } from '../../../core/services/group.service';
import { StudentService } from '../../../core/services/student.service';
import { Attendance, AttendanceStatus, Group, Student } from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-attendance-history',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './attendance-history.component.html',
  styleUrl: './attendance-history.component.scss'
})
export class AttendanceHistoryComponent {
  private readonly fb = inject(FormBuilder);
  private readonly attendanceService = inject(AttendanceService);
  private readonly groupService = inject(GroupService);
  private readonly studentService = inject(StudentService);

  readonly groups = signal<Group[]>([]);
  readonly students = signal<Student[]>([]);
  readonly rows = signal<Attendance[]>([]);
  readonly loading = signal(false);
  readonly columns = ['date', 'studentName', 'groupName', 'status', 'teacherName'];

  readonly form = this.fb.nonNullable.group({
    studentId: [''],
    groupId: [''],
    from: [null as Date | null],
    to: [null as Date | null],
    status: ['' as AttendanceStatus | '']
  });

  constructor() {
    this.groupService.getGroups().subscribe((groups) => this.groups.set(groups));
    this.studentService.getStudents().subscribe((students) => this.students.set(students));
    this.search();
  }

  search(): void {
    const value = this.form.getRawValue();
    this.loading.set(true);
    this.attendanceService
      .getAttendance({
        studentId: value.studentId || undefined,
        groupId: value.groupId || undefined,
        from: value.from ? this.toIso(value.from) : undefined,
        to: value.to ? this.toIso(value.to) : undefined,
        status: value.status || undefined
      })
      .subscribe({
        next: (rows) => {
          this.rows.set(rows.slice(0, 200));
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  private toIso(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
