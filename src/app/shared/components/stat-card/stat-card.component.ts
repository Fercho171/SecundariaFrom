import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  imports: [MatIconModule],
  template: `
    <article class="stat-card" [attr.data-tone]="tone()">
      <div class="icon" aria-hidden="true">
        <mat-icon>{{ icon() }}</mat-icon>
      </div>
      <div>
        <p class="label">{{ label() }}</p>
        <p class="value">{{ value() }}</p>
        @if (hint()) {
          <p class="hint">{{ hint() }}</p>
        }
      </div>
    </article>
  `,
  styles: `
    .stat-card {
      display: flex;
      gap: 0.9rem;
      align-items: center;
      background: #fff;
      border-radius: 18px;
      padding: 1rem 1.1rem;
      box-shadow: var(--school-shadow);
      min-height: 96px;
    }
    .icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      display: grid;
      place-items: center;
      background: #e8f4f2;
      color: var(--school-teal);
      flex-shrink: 0;
    }
    .stat-card[data-tone='danger'] .icon { background: #fdecea; color: #c62828; }
    .stat-card[data-tone='warning'] .icon { background: #fff4e5; color: #ef6c00; }
    .stat-card[data-tone='info'] .icon { background: #e8f1fb; color: #1565c0; }
    .stat-card[data-tone='success'] .icon { background: #e8f5e9; color: #2e7d32; }
    .label { margin: 0; color: var(--school-muted); font-size: 0.9rem; }
    .value { margin: 0.15rem 0 0; font-size: 1.55rem; font-weight: 700; line-height: 1.1; }
    .hint { margin: 0.2rem 0 0; color: var(--school-muted); font-size: 0.8rem; }
  `
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input('insights');
  readonly hint = input('');
  readonly tone = input<'default' | 'danger' | 'warning' | 'info' | 'success'>('default');
}
