import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { JustificationService } from '../../../core/services/justification.service';
import { Justification } from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-justification-list',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './justification-list.component.html',
  styleUrl: './justification-list.component.scss'
})
export class JustificationListComponent {
  private readonly justificationService = inject(JustificationService);
  readonly loading = signal(true);
  readonly justifications = signal<Justification[]>([]);

  constructor() {
    this.justificationService.getJustifications().subscribe({
      next: (items) => {
        this.justifications.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
