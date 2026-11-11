import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { GroupService } from '../../../core/services/group.service';
import { Group, Student } from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-group-detail',
  imports: [RouterLink, MatButtonModule, MatProgressSpinnerModule, PageHeaderComponent],
  templateUrl: './group-detail.component.html',
  styleUrl: './group-detail.component.scss'
})
export class GroupDetailComponent {
  readonly id = input.required<string>();
  private readonly groupService = inject(GroupService);
  readonly loading = signal(true);
  readonly group = signal<Group | null>(null);
  readonly students = signal<Student[]>([]);

  constructor() {
    effect(() => {
      const groupId = this.id();
      untracked(() => this.load(groupId));
    });
  }

  private load(groupId: string): void {
    this.loading.set(true);
    forkJoin({
      group: this.groupService.getGroupById(groupId),
      students: this.groupService.getGroupStudents(groupId)
    }).subscribe({
      next: ({ group, students }) => {
        this.group.set(group);
        this.students.set(students);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
