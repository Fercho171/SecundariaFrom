import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScheduleService } from '../../../core/services/schedule.service';
import { TeacherWorkHours } from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-work-hours',
  imports: [DecimalPipe, MatProgressSpinnerModule, PageHeaderComponent, StatCardComponent],
  templateUrl: './work-hours.component.html',
  styleUrl: './work-hours.component.scss'
})
export class WorkHoursComponent {
  private readonly scheduleService = inject(ScheduleService);

  readonly loading = signal(true);
  readonly rows = signal<TeacherWorkHours[]>([]);

  constructor() {
    this.scheduleService.getWorkHours().subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  totalContracted(): number {
    return this.rows().reduce((sum, row) => sum + row.contractedHours, 0);
  }

  totalWeekly(): number {
    return this.rows().reduce((sum, row) => sum + row.weeklyClassHours, 0);
  }
}
