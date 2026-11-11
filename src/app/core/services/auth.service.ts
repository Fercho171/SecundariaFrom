import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, User } from '../models';
import { StorageService } from './storage.service';
import { SKIP_AUTH } from '../interceptors/http-context';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  private readonly currentUserSignal = signal<User | null>(this.storage.getUser<User>());
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.getToken() && !!this.currentUserSignal());

  getToken(): string | null {
    return this.storage.getToken();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials, {
        context: new HttpContext().set(SKIP_AUTH, true)
      })
      .pipe(
        map((response) => {
          if (!response?.token || !response.user?.id || !response.user.username) {
            throw new HttpErrorResponse({
              status: 422,
              statusText: 'Unprocessable Entity',
              error: { message: 'No se pudo iniciar sesión. Inténtalo de nuevo.' }
            });
          }
          return response;
        }),
        tap((response) => this.applySession(response))
      );
  }

  logout(): void {
    this.storage.clearSession();
    this.currentUserSignal.set(null);
    void this.router.navigate(['/login']);
  }

  private applySession(response: LoginResponse): void {
    this.storage.setToken(response.token);
    this.storage.setUser(response.user);
    this.currentUserSignal.set(response.user);
  }
}
