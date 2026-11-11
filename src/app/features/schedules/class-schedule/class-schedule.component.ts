import { Component, computed, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScheduleService } from '../../../core/services/schedule.service';
import { GroupService } from '../../../core/services/group.service';
import {
  ClassPeriod,
  Group,
  ScheduleSlot,
  WEEKDAYS,
  Weekday
} from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-class-schedule',
  imports: [MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule, PageHeaderComponent],
  templateUrl: './class-schedule.component.html',
  styleUrl: './class-schedule.component.scss'
})
export class ClassScheduleComponent {
  private readonly scheduleService = inject(ScheduleService);
  private readonly groupService = inject(GroupService);

  readonly weekdays = WEEKDAYS;
  readonly loading = signal(true);
  readonly periods = signal<ClassPeriod[]>([]);
  readonly groups = signal<Group[]>([]);
  readonly slots = signal<ScheduleSlot[]>([]);
  readonly selectedWeekday = signal<Weekday>(this.todayWeekday());
  readonly selectedGroupId = signal('');

  readonly visibleGroups = computed(() => {
    const groupId = this.selectedGroupId();
    return groupId ? this.groups().filter((group) => group.id === groupId) : this.groups();
  });

  readonly grid = computed(() => {
    const groups = this.visibleGroups();
    return this.periods().map((period) => ({
      period,
      cells: groups.map((group) => ({
        group,
        slot:
          this.slots().find((item) => item.periodId === period.id && item.groupId === group.id) ??
          null
      }))
    }));
  });

  constructor() {
    this.scheduleService.getPeriods().subscribe((periods) => this.periods.set(periods));
    this.groupService.getGroups().subscribe((groups) => this.groups.set(groups));
    this.load();
  }

  onWeekdayChange(value: Weekday): void {
    this.selectedWeekday.set(value);
    this.load();
  }

  onGroupChange(value: string): void {
    this.selectedGroupId.set(value);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.scheduleService
      .getClassSchedule(this.selectedWeekday(), this.selectedGroupId() || undefined)
      .subscribe({
        next: (slots) => {
          this.slots.set(slots);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  private todayWeekday(): Weekday {
    const day = new Date().getDay();
    const map: Record<number, Weekday> = {
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY'
    };
    return map[day] ?? 'MONDAY';
  }
}
