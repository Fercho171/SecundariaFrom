import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { ScheduleService } from '../../../core/services/schedule.service';
import { GroupService } from '../../../core/services/group.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  ClassPeriod,
  CoverAssignment,
  COVER_FILE_ACCEPT,
  CoverFileType,
  coverFileTypeFromName,
  Group,
  UncoveredHour
} from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-cover-work',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './cover-work.component.html',
  styleUrl: './cover-work.component.scss'
})
export class CoverWorkComponent {
  private readonly fb = inject(FormBuilder);
  private readonly scheduleService = inject(ScheduleService);
  private readonly groupService = inject(GroupService);
  private readonly notifications = inject(NotificationService);

  readonly accept = COVER_FILE_ACCEPT;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly selectedDate = signal(new Date());
  readonly groups = signal<Group[]>([]);
  readonly periods = signal<ClassPeriod[]>([]);
  readonly uncovered = signal<UncoveredHour[]>([]);
  readonly assignments = signal<CoverAssignment[]>([]);
  readonly fileName = signal('');
  readonly fileType = signal<CoverFileType | null>(null);
  private selectedFile: File | null = null;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(4)]],
    groupId: ['', Validators.required],
    periodId: [null as number | null, Validators.required],
    absentTeacherName: [''],
    subject: [''],
    instructions: ['']
  });

  constructor() {
    this.scheduleService.getPeriods().subscribe((periods) => this.periods.set(periods));
    this.groupService.getGroups().subscribe((groups) => this.groups.set(groups));
    this.load();
  }

  onDateChange(date: Date | null): void {
    if (!date) {
      return;
    }
    this.selectedDate.set(date);
    this.load();
  }

  useHour(hour: UncoveredHour): void {
    this.form.patchValue({
      title: `Trabajo de ${hour.subject} · ${hour.groupName}`,
      groupId: hour.groupId,
      periodId: hour.periodId,
      absentTeacherName: hour.absentTeacherName,
      subject: hour.subject,
      instructions: `Actividad para cubrir la ${hour.periodLabel} sin maestro (${hour.absentTeacherName}).`
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      this.selectedFile = null;
      this.fileName.set('');
      this.fileType.set(null);
      return;
    }
    const type = coverFileTypeFromName(file.name);
    if (!type) {
      this.notifications.error('Solo se permiten PDF, imágenes, Word o Excel.');
      input.value = '';
      return;
    }
    this.selectedFile = file;
    this.fileName.set(file.name);
    this.fileType.set(type);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.selectedFile) {
      this.notifications.error('Adjunta un archivo PDF, imagen, Word o Excel.');
      return;
    }
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.scheduleService
      .createCoverAssignment({
        title: value.title,
        date: this.toIso(this.selectedDate()),
        groupId: value.groupId,
        periodId: Number(value.periodId),
        absentTeacherName: value.absentTeacherName,
        subject: value.subject,
        instructions: value.instructions,
        file: this.selectedFile
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.notifications.success('Trabajo cargado para la hora sin maestro.');
          this.form.reset();
          this.selectedFile = null;
          this.fileName.set('');
          this.fileType.set(null);
          this.load();
        },
        error: () => this.saving.set(false)
      });
  }

  download(item: CoverAssignment): void {
    this.scheduleService.downloadCoverFile(item.id, item.fileName).subscribe({
      error: () => this.notifications.error('No se pudo descargar el archivo.')
    });
  }

  fileIcon(type: CoverFileType): string {
    const icons: Record<CoverFileType, string> = {
      PDF: 'picture_as_pdf',
      IMAGE: 'image',
      WORD: 'description',
      EXCEL: 'table_chart'
    };
    return icons[type];
  }

  fileLabel(type: CoverFileType): string {
    const labels: Record<CoverFileType, string> = {
      PDF: 'PDF',
      IMAGE: 'Imagen',
      WORD: 'Word',
      EXCEL: 'Excel'
    };
    return labels[type];
  }

  private load(): void {
    this.loading.set(true);
    const date = this.toIso(this.selectedDate());
    forkJoin({
      uncovered: this.scheduleService.getUncoveredHours(date),
      assignments: this.scheduleService.getCoverAssignments(date)
    }).subscribe({
      next: ({ uncovered, assignments }) => {
        this.uncovered.set(uncovered);
        this.assignments.set(assignments);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private toIso(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
