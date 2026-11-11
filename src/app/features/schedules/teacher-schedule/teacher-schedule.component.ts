import { Component, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScheduleService } from '../../../core/services/schedule.service';
import {
  ClassPeriod,
  TeacherScheduleView,
  WEEKDAYS
} from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-teacher-schedule',
  imports: [MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule, PageHeaderComponent],
  templateUrl: './teacher-schedule.component.html',
  styleUrl: './teacher-schedule.component.scss'
})
export class TeacherScheduleComponent {
  private readonly scheduleService = inject(ScheduleService);

  readonly weekdays = WEEKDAYS;
  readonly loading = signal(true);
  readonly periods = signal<ClassPeriod[]>([]);
  readonly schedules = signal<TeacherScheduleView[]>([]);
  readonly selectedTeacherId = signal('');

  constructor() {
    this.scheduleService.getPeriods().subscribe((periods) => this.periods.set(periods));
    this.scheduleService.getTeacherSchedules().subscribe({
      next: (schedules) => {
        this.schedules.set(schedules);
        if (schedules.length) {
          const fernando = schedules.find((item) => item.teacherId === 't4');
          this.selectedTeacherId.set((fernando ?? schedules[0]).teacherId);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  current(): TeacherScheduleView | null {
    return this.schedules().find((item) => item.teacherId === this.selectedTeacherId()) ?? null;
  }

  slotFor(weekday: string, periodId: number) {
    return this.current()?.slots.find((slot) => slot.weekday === weekday && slot.periodId === periodId) ?? null;
  }

  onTeacherChange(teacherId: string): void {
    this.selectedTeacherId.set(teacherId);
  }
}
