import { ApplicationRef, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly appRef = inject(ApplicationRef);

  readonly schoolName = environment.schoolName;
  readonly hidePassword = signal(true);
  readonly loading = signal(false);
  readonly authError = signal('');

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(5)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authError.set('');
    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        void this.enterApp();
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.authError.set(loginErrorMessage(error));
      }
    });
  }

  private async enterApp(): Promise<void> {
    this.loading.set(false);
    const opened = await this.router.navigateByUrl('/attendance', { replaceUrl: true });
    if (!opened) {
      await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    }
    // Asegura el pintado inmediato de layout y rutas hijas en modo zoneless.
    this.appRef.tick();
  }
}

function loginErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No hay conexión con el servidor.';
  }
  if (error.status === 401) {
    return 'Usuario o contraseña incorrectos.';
  }
  if (error.status === 403) {
    return 'No tienes permisos para iniciar sesión.';
  }
  if (error.status >= 500) {
    return 'Ocurrió un error en el servidor. Inténtalo más tarde.';
  }

  const backendMessage = error.error?.message;
  if (isUserFacingMessage(backendMessage)) {
    return backendMessage;
  }

  return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}

function isUserFacingMessage(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length < 180 &&
    !/exception|stack trace|sql|nullpointer|internal server/i.test(value)
  );
}
