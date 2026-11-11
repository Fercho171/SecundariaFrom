import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  imports: [MatIconModule],
  template: `
    <div class="empty">
      <mat-icon>{{ icon() }}</mat-icon>
      <h3>{{ title() }}</h3>
      <p>{{ message() }}</p>
      <ng-content />
    </div>
  `,
  styles: `
    .empty {
      text-align: center;
      padding: 2.5rem 1rem;
      color: var(--school-muted);
    }
    mat-icon { font-size: 48px; width: 48px; height: 48px; }
    h3 { margin: 0.75rem 0 0.35rem; color: var(--school-navy); }
    p { margin: 0; }
  `
})
export class EmptyStateComponent {
  readonly title = input('Sin resultados');
  readonly message = input('No hay información para mostrar.');
  readonly icon = input('inbox');
}
