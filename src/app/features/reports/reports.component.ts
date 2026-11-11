import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportService } from '../../core/services/report.service';
import { GroupService } from '../../core/services/group.service';
import { StudentService } from '../../core/services/student.service';
import { NotificationService } from '../../core/services/notification.service';
import { AttendanceReport, Group, ReportType, Student } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AttendanceStatusPipe } from '../../shared/pipes/attendance-status.pipe';

@Component({
  selector: 'app-reports',
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    AttendanceStatusPipe
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ReportService);
  private readonly groupService = inject(GroupService);
  private readonly studentService = inject(StudentService);
  private readonly notifications = inject(NotificationService);

  readonly groups = signal<Group[]>([]);
  readonly students = signal<Student[]>([]);
  readonly report = signal<AttendanceReport | null>(null);
  readonly loading = signal(false);
  readonly exporting = signal(false);
  readonly columns = ['date', 'studentName', 'groupName', 'status', 'absences', 'percentage', 'teacherName'];
  readonly types: { value: ReportType; label: string }[] = [
    { value: 'DAILY', label: 'Reporte diario' },
    { value: 'MONTHLY', label: 'Reporte mensual' },
    { value: 'BY_GROUP', label: 'Reporte por grupo' },
    { value: 'BY_STUDENT', label: 'Reporte por alumno' },
    { value: 'TOP_ABSENCES', label: 'Alumnos con mayor número de faltas' }
  ];

  readonly form = this.fb.nonNullable.group({
    type: ['DAILY' as ReportType, Validators.required],
    groupId: [''],
    studentId: [''],
    from: [null as Date | null],
    to: [null as Date | null]
  });

  constructor() {
    this.groupService.getGroups().subscribe((groups) => this.groups.set(groups));
    this.studentService.getStudents().subscribe((students) => this.students.set(students));
    this.generate();
  }

  generate(): void {
    this.loading.set(true);
    this.reportService.getAttendanceReport(this.filters()).subscribe({
      next: (report) => {
        this.report.set(report);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  exportExcel(): void {
    this.exporting.set(true);
    this.reportService.exportExcel(this.filters()).subscribe({
      next: () => {
        this.exporting.set(false);
        this.notifications.success('Excel generado.');
      },
      error: () => this.exporting.set(false)
    });
  }

  exportPdf(): void {
    this.exporting.set(true);
    this.reportService.exportPdf(this.filters()).subscribe({
      next: () => {
        this.exporting.set(false);
        this.notifications.success('PDF generado.');
      },
      error: () => this.exporting.set(false)
    });
  }

  private filters() {
    const value = this.form.getRawValue();
    return {
      type: value.type,
      groupId: value.groupId || undefined,
      studentId: value.studentId || undefined,
      from: value.from ? this.toIso(value.from) : undefined,
      to: value.to ? this.toIso(value.to) : undefined
    };
  }

  private toIso(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
