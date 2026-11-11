import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GroupService } from '../../../core/services/group.service';
import { Group } from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-group-list',
  imports: [RouterLink, MatButtonModule, MatProgressSpinnerModule, PageHeaderComponent],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.scss'
})
export class GroupListComponent {
  private readonly groupService = inject(GroupService);
  readonly loading = signal(true);
  readonly groups = signal<Group[]>([]);

  constructor() {
    this.groupService.getGroups().subscribe({
      next: (groups) => {
        this.groups.set(groups);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  byGrade(grade: number): Group[] {
    return this.groups().filter((group) => group.grade === grade);
  }
}
