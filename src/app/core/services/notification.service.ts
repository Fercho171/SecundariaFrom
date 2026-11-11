import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: ['snack-success'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 6000,
      panelClass: ['snack-error'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  info(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
