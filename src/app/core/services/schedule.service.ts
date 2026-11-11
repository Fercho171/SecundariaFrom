import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, throwError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ClassPeriod,
  CoverAssignment,
  CoverAssignmentRequest,
  ScheduleSlot,
  Teacher,
  TeacherAbsence,
  TeacherScheduleView,
  TeacherWorkHours,
  UncoveredHour,
  Weekday
} from '../models';
import { MockStore } from '../mock/mock-store';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly http = inject(HttpClient);
  private readonly mockStore = inject(MockStore);
  private readonly base = `${environment.apiUrl}/schedules`;

  getPeriods(): Observable<ClassPeriod[]> {
    if (environment.useMockApi) {
      return of([...this.mockStore.getPeriods()]);
    }
    return this.http.get<ClassPeriod[]>(`${this.base}/periods`);
  }

  getTeachers(): Observable<Teacher[]> {
    if (environment.useMockApi) {
      return of([...this.mockStore.getTeachers()]);
    }
    return this.http.get<Teacher[]>(`${environment.apiUrl}/teachers`);
  }

  getClassSchedule(weekday?: Weekday, groupId?: string): Observable<ScheduleSlot[]> {
    if (environment.useMockApi) {
      try {
        return of([...this.mockStore.getClassSchedule(weekday, groupId)]);
      } catch (error) {
        return throwError(() => error);
      }
    }
    let params = new HttpParams();
    if (weekday) params = params.set('weekday', weekday);
    if (groupId) params = params.set('groupId', groupId);
    return this.http.get<ScheduleSlot[]>(`${this.base}/classes`, { params });
  }

  getTeacherSchedules(): Observable<TeacherScheduleView[]> {
    if (environment.useMockApi) {
      return of([...this.mockStore.getTeacherSchedules()]);
    }
    return this.http.get<TeacherScheduleView[]>(`${this.base}/teachers`);
  }

  getTeacherSchedule(teacherId: string): Observable<TeacherScheduleView> {
    if (environment.useMockApi) {
      try {
        return of({ ...this.mockStore.getTeacherSchedule(teacherId) });
      } catch (error) {
        return throwError(() => error);
      }
    }
    return this.http.get<TeacherScheduleView>(`${this.base}/teachers/${teacherId}`);
  }

  getTeacherAbsences(date?: string): Observable<TeacherAbsence[]> {
    if (environment.useMockApi) {
      return of([...this.mockStore.getTeacherAbsences(date)]);
    }
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<TeacherAbsence[]>(`${this.base}/absences`, { params });
  }

  getWorkHours(): Observable<TeacherWorkHours[]> {
    if (environment.useMockApi) {
      return of([...this.mockStore.getWorkHours()]);
    }
    return this.http.get<TeacherWorkHours[]>(`${this.base}/work-hours`);
  }

  getUncoveredHours(date?: string): Observable<UncoveredHour[]> {
    if (environment.useMockApi) {
      return of([...this.mockStore.getUncoveredHours(date)]);
    }
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<UncoveredHour[]>(`${this.base}/uncovered-hours`, { params });
  }

  getCoverAssignments(date?: string): Observable<CoverAssignment[]> {
    if (environment.useMockApi) {
      return of([...this.mockStore.getCoverAssignments(date)]);
    }
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<CoverAssignment[]>(`${this.base}/cover-work`, { params });
  }

  createCoverAssignment(request: CoverAssignmentRequest): Observable<CoverAssignment> {
    if (environment.useMockApi) {
      try {
        return of(this.mockStore.createCoverAssignment(request));
      } catch (error) {
        return throwError(() => error);
      }
    }
    const formData = new FormData();
    formData.append('title', request.title);
    formData.append('date', request.date);
    formData.append('groupId', request.groupId);
    formData.append('periodId', String(request.periodId));
    formData.append('absentTeacherName', request.absentTeacherName);
    formData.append('subject', request.subject);
    formData.append('instructions', request.instructions);
    formData.append('file', request.file, request.file.name);
    return this.http.post<CoverAssignment>(`${this.base}/cover-work`, formData);
  }

  downloadCoverFile(id: string, fileName: string): Observable<void> {
    if (environment.useMockApi) {
      try {
        const file = this.mockStore.downloadCoverFile(id);
        this.saveBlob(file.blob, file.fileName);
        return of(void 0);
      } catch (error) {
        return throwError(() => error);
      }
    }
    return this.http.get(`${this.base}/cover-work/${id}/file`, { responseType: 'blob' }).pipe(
      tap((blob) => this.saveBlob(blob, fileName)),
      map(() => undefined)
    );
  }

  private saveBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
