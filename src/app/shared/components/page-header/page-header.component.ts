import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">{{ eyebrow() }}</p>
        <h1>{{ title() }}</h1>
        @if (subtitle()) {
          <p class="subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="actions">
        <ng-content />
      </div>
    </header>
  `,
  styles: `
    .page-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }
    .eyebrow {
      margin: 0 0 0.25rem;
      color: var(--school-teal);
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 0.75rem;
    }
    h1 {
      margin: 0;
      font-size: clamp(1.5rem, 2vw, 2rem);
      line-height: 1.2;
    }
    .subtitle {
      margin: 0.35rem 0 0;
      color: var(--school-muted);
    }
    .actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
  `
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly eyebrow = input('Control escolar');
}
