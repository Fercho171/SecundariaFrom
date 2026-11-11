import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  private readonly onlineSignal = signal(typeof navigator === 'undefined' ? true : navigator.onLine);
  readonly online = this.onlineSignal.asReadonly();
  readonly offline = computed(() => !this.onlineSignal());

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    window.addEventListener('online', () => this.onlineSignal.set(true));
    window.addEventListener('offline', () => this.onlineSignal.set(false));
  }
}
