import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  details?: { label: string; value: string | number }[];
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      @if (data.details?.length) {
        <ul class="details">
          @for (item of data.details; track item.label) {
            <li>
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </li>
          }
        </ul>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton (click)="dialogRef.close(false)">{{ data.cancelText || 'Cancelar' }}</button>
      <button matButton="filled" (click)="dialogRef.close(true)">
        {{ data.confirmText || 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    p { margin: 0 0 1rem; font-size: 1rem; }
    .details {
      list-style: none;
      margin: 0;
      padding: 0.75rem 1rem;
      background: #f4f8f7;
      border-radius: 12px;
    }
    .details li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.35rem 0;
      font-size: 1rem;
    }
    mat-dialog-actions button { min-height: 48px; min-width: 120px; }
  `
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent, boolean>);
}
