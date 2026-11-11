import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

const ERROR_MESSAGES: Record<number, string> = {
  400: 'La solicitud no es válida. Revisa los datos e inténtalo de nuevo.',
  401: 'No tienes una sesión activa o tus credenciales no son correctas.',
  403: 'No tienes permisos para realizar esta operación.',
  404: 'No se encontró la información solicitada.',
  409: 'Ya existe un registro de asistencia para este alumno.',
  500: 'Ocurrió un error en el servidor. Inténtalo más tarde.'
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLogin = req.url.includes('/auth/login');
      let message = ERROR_MESSAGES[error.status] ?? 'No se pudo completar la operación.';

      if (error.status === 0) {
        message = 'No hay conexión con el servidor.';
      } else if (isLogin && error.status === 401) {
        message = 'Usuario o contraseña incorrectos.';
      } else if (req.url.includes('/attendance') && req.method === 'POST' && error.status >= 500) {
        message = 'No se pudo guardar la asistencia.';
      } else if (typeof error.error === 'object' && error.error?.message) {
        message = error.error.message;
      }

      if (!isLogin) {
        notifications.error(message);
      }

      if (error.status === 401 && !isLogin) {
        auth.logout();
      }

      return throwError(() => error);
    })
  );
};
