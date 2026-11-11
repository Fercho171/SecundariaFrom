import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Group, Student } from '../models';
import { MockStore } from '../mock/mock-store';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private readonly http = inject(HttpClient);
  private readonly mockStore = inject(MockStore);
  private readonly base = `${environment.apiUrl}/groups`;

  getGroups(): Observable<Group[]> {
    if (environment.useMockApi) {
      try {
        return of([...this.mockStore.getGroups()]);
      } catch (error) {
        return throwError(() => error);
      }
    }
    return this.http.get<Group[]>(this.base);
  }

  getGroupById(id: string): Observable<Group> {
    if (environment.useMockApi) {
      try {
        return of({ ...this.mockStore.getGroup(id) });
      } catch (error) {
        return throwError(() => error);
      }
    }
    return this.http.get<Group>(`${this.base}/${id}`);
  }

  getGroupStudents(id: string): Observable<Student[]> {
    if (environment.useMockApi) {
      try {
        return of([...this.mockStore.getGroupStudents(id)]);
      } catch (error) {
        return throwError(() => error);
      }
    }
    return this.http.get<Student[]>(`${this.base}/${id}/students`);
  }
}
