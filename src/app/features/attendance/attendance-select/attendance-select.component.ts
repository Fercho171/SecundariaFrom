import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GroupService } from '../../../core/services/group.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Group } from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-attendance-select',
  imports: [
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './attendance-select.component.html',
  styleUrl: './attendance-select.component.scss'
})
export class AttendanceSelectComponent {
  private readonly groupService = inject(GroupService);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(true);
  readonly groups = signal<Group[]>([]);

  constructor() {
    this.groupService.getGroups().subscribe({
      next: (groups) => {
        this.groups.set(groups);
        this.loading.set(false);
      },
      error: () => {
        this.groups.set([]);
        this.loading.set(false);
        this.notifications.error('No se pudieron cargar los grupos.');
      }
    });
  }
}
