import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { ConnectivityService } from './connectivity.service';
import { AttendanceBatchRequest } from '../models';

export type OfflineOperationType = 'CREATE_ATTENDANCE' | 'CREATE_JUSTIFICATION';

export interface PendingOperation {
  id: string;
  type: OfflineOperationType;
  payload: unknown;
  createdAt: string;
  synced: boolean;
  fingerprint: string;
}

@Injectable({ providedIn: 'root' })
export class OfflineQueueService {
  private readonly storage = inject(StorageService);
  private readonly connectivity = inject(ConnectivityService);

  private readonly queueSignal = signal<PendingOperation[]>(this.storage.getOfflineQueue<PendingOperation>());
  readonly pending = computed(() => this.queueSignal().filter((item) => !item.synced));

  enqueueAttendance(payload: AttendanceBatchRequest): PendingOperation {
    const fingerprint = `attendance:${payload.groupId}:${payload.date}`;
    const existing = this.queueSignal().find((item) => item.fingerprint === fingerprint && !item.synced);
    if (existing) {
      const updated: PendingOperation = {
        ...existing,
        payload,
        createdAt: new Date().toISOString()
      };
      this.replace(updated);
      return updated;
    }
    return this.enqueue('CREATE_ATTENDANCE', payload, fingerprint);
  }

  enqueueJustification(payload: unknown, fingerprint: string): PendingOperation {
    return this.enqueue('CREATE_JUSTIFICATION', payload, fingerprint);
  }

  markSynced(id: string): void {
    const next = this.queueSignal().map((item) => (item.id === id ? { ...item, synced: true } : item));
    this.persist(next);
  }

  /**
   * Punto de extensión para sincronizar con el backend cuando haya conexión.
   * No ejecuta sincronización compleja en esta versión.
   */
  async syncPending(): Promise<void> {
    if (this.connectivity.offline()) {
      return;
    }
    // Futuro: POST de cada operación pendiente y markSynced al confirmar 2xx.
  }

  private enqueue(type: OfflineOperationType, payload: unknown, fingerprint: string): PendingOperation {
    const operation: PendingOperation = {
      id: crypto.randomUUID(),
      type,
      payload,
      fingerprint,
      createdAt: new Date().toISOString(),
      synced: false
    };
    this.persist([...this.queueSignal(), operation]);
    return operation;
  }

  private replace(updated: PendingOperation): void {
    const next = this.queueSignal().map((item) => (item.id === updated.id ? updated : item));
    this.persist(next);
  }

  private persist(items: PendingOperation[]): void {
    this.queueSignal.set(items);
    this.storage.setOfflineQueue(items);
  }
}
