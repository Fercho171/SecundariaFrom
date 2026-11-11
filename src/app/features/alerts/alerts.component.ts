import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportService } from '../../core/services/report.service';
import { AlertStudent } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AlertLevelPipe } from '../../shared/pipes/alert-level.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-alerts',
  imports: [
    DecimalPipe,
    RouterLink,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    AlertLevelPipe,
    EmptyStateComponent
  ],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss'
})
export class AlertsComponent {
  private readonly reportService = inject(ReportService);
  readonly loading = signal(true);
  readonly students = signal<AlertStudent[]>([]);

  constructor() {
    this.reportService.getAlertStudents().subscribe({
      next: (students) => {
        this.students.set(students);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
