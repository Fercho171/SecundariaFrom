import { Injectable } from '@angular/core';

const TOKEN_KEY = 'asistencia.session.token';
const USER_KEY = 'asistencia.session.user';
const QUEUE_KEY = 'asistencia.offline.queue';

@Injectable({ providedIn: 'root' })
export class StorageService {
  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  getUser<T>(): T | null {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setUser<T>(user: T): void {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearSession(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  getOfflineQueue<T>(): T[] {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }

  setOfflineQueue<T>(items: T[]): void {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  }
}
