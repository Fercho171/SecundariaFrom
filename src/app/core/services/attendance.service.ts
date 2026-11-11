import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Attendance, AttendanceBatchRequest, AttendanceFilters } from '../models';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/attendance`;

  saveBatch(request: AttendanceBatchRequest) {
    return this.http.post<Attendance[]>(this.base, request);
  }

  update(id: string, status: Attendance['status']) {
    return this.http.put<Attendance>(`${this.base}/${id}`, { status });
  }

  getAttendance(filters: AttendanceFilters = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<Attendance[]>(this.base, { params });
  }

  getByStudent(studentId: string) {
    return this.http.get<Attendance[]>(`${this.base}/student/${studentId}`);
  }

  getByGroup(groupId: string, date?: string) {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<Attendance[]>(`${this.base}/group/${groupId}`, { params });
  }
}
