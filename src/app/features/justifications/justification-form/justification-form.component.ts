import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { StudentService } from '../../../core/services/student.service';
import { JustificationService } from '../../../core/services/justification.service';
import { NotificationService } from '../../../core/services/notification.service';
import { JUSTIFICATION_REASONS, Student } from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-justification-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    PageHeaderComponent
  ],
  templateUrl: './justification-form.component.html',
  styleUrl: './justification-form.component.scss'
})
export class JustificationFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly studentService = inject(StudentService);
  private readonly justificationService = inject(JustificationService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly students = signal<Student[]>([]);
  readonly reasons = JUSTIFICATION_REASONS;
  readonly loading = signal(false);
  readonly fileName = signal('');
  private selectedFile: File | null = null;

  readonly form = this.fb.nonNullable.group({
    studentId: ['', Validators.required],
    date: [null as Date | null, Validators.required],
    reason: ['', Validators.required],
    notes: ['']
  });

  constructor() {
    this.studentService.getStudents().subscribe((students) => this.students.set(students));
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile = file;
    this.fileName.set(file?.name ?? '');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.loading.set(true);
    this.justificationService
      .create({
        studentId: value.studentId,
        date: this.toIso(value.date!),
        reason: value.reason as (typeof JUSTIFICATION_REASONS)[number]['value'],
        notes: value.notes,
        file: this.selectedFile
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.notifications.success('Justificación registrada.');
          void this.router.navigate(['/justifications']);
        },
        error: () => this.loading.set(false)
      });
  }

  private toIso(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
