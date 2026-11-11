import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentService } from '../../../core/services/student.service';
import { GroupService } from '../../../core/services/group.service';
import { Group, Student } from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-student-list',
  imports: [
    RouterLink,
    DecimalPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    PageHeaderComponent
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss'
})
export class StudentListComponent {
  private readonly studentService = inject(StudentService);
  private readonly groupService = inject(GroupService);

  readonly search = new FormControl('', { nonNullable: true });
  readonly groupId = new FormControl('', { nonNullable: true });
  readonly groups = signal<Group[]>([]);
  readonly students = signal<Student[]>([]);
  readonly loading = signal(true);
  readonly columns = ['studentNumber', 'firstName', 'lastName', 'groupName', 'status', 'attendancePercentage'];

  constructor() {
    this.groupService.getGroups().subscribe((groups) => this.groups.set(groups));
    this.search.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.load());
    this.groupId.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.load());
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.studentService
      .getStudents({
        search: this.search.value,
        groupId: this.groupId.value || undefined
      })
      .subscribe({
        next: (students) => {
          this.students.set(students);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }
}
