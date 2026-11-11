import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScheduleService } from '../../../core/services/schedule.service';
import { TeacherAbsence, WEEKDAYS } from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-teacher-absences',
  imports: [
    DatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatCardComponent
  ],
  templateUrl: './teacher-absences.component.html',
  styleUrl: './teacher-absences.component.scss'
})
export class TeacherAbsencesComponent {
  private readonly scheduleService = inject(ScheduleService);

  readonly loading = signal(true);
  readonly absences = signal<TeacherAbsence[]>([]);
  readonly selectedDate = signal(new Date());

  constructor() {
    this.load();
  }

  onDateChange(date: Date | null): void {
    if (!date) {
      return;
    }
    this.selectedDate.set(date);
    this.load();
  }

  weekdayLabel(value: string): string {
    return WEEKDAYS.find((day) => day.value === value)?.label ?? value;
  }

  coveredCount(): number {
    return this.absences().filter((item) => !!item.coveredBy).length;
  }

  private load(): void {
    this.loading.set(true);
    const date = this.toIso(this.selectedDate());
    this.scheduleService.getTeacherAbsences(date).subscribe({
      next: (absences) => {
        this.absences.set(absences);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private toIso(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
