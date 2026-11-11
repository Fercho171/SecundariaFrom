import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../core/services/dashboard.service';
import { Dashboard } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { AlertLevelPipe } from '../../shared/pipes/alert-level.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    DecimalPipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    StatCardComponent,
    AlertLevelPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);
  readonly loading = signal(true);
  readonly dashboard = signal<Dashboard | null>(null);

  constructor() {
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
