import { Component, input } from '@angular/core';
import { MonthlyAttendancePoint } from '../../../core/models';

@Component({
  selector: 'app-attendance-chart',
  template: `
    <div class="chart" role="img" [attr.aria-label]="'Asistencia mensual'">
      @for (point of points(); track point.month) {
        <div class="col">
          <div class="bar-wrap">
            <div class="bar" [style.height.%]="point.percentage"></div>
          </div>
          <span class="value">{{ point.percentage }}%</span>
          <span class="label">{{ point.monthLabel }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    .chart {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 0.75rem;
      align-items: end;
      min-height: 180px;
    }
    .col { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; }
    .bar-wrap {
      width: 100%;
      height: 140px;
      background: #eef3f2;
      border-radius: 12px 12px 6px 6px;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
    }
    .bar {
      width: 100%;
      background: linear-gradient(180deg, #1a7a62, #0f5c6b);
      border-radius: 12px 12px 6px 6px;
      min-height: 8px;
    }
    .value { font-size: 0.75rem; font-weight: 700; }
    .label { color: var(--school-muted); font-size: 0.8rem; }
  `
})
export class AttendanceChartComponent {
  readonly points = input.required<MonthlyAttendancePoint[]>();
}
