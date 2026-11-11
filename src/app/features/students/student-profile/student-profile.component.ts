import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StudentService } from '../../../core/services/student.service';
import { StudentProfile } from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { AttendanceChartComponent } from '../../../shared/components/attendance-chart/attendance-chart.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-student-profile',
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    MatButtonModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    StatCardComponent,
    AttendanceChartComponent,
    StatusBadgeComponent
  ],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.scss'
})
export class StudentProfileComponent {
  readonly id = input.required<string>();
  private readonly studentService = inject(StudentService);
  readonly loading = signal(true);
  readonly student = signal<StudentProfile | null>(null);

  constructor() {
    effect(() => {
      const studentId = this.id();
      untracked(() => this.load(studentId));
    });
  }

  private load(id: string): void {
    this.loading.set(true);
    this.studentService.getStudentById(id).subscribe({
      next: (student) => {
        this.student.set(student);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
