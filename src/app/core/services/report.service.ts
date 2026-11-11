import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlertStudent, AttendanceReport, ReportFilters } from '../models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reports`;

  getAttendanceReport(filters: ReportFilters) {
    return this.http.get<AttendanceReport>(`${this.base}/attendance`, {
      params: this.toParams(filters)
    });
  }

  exportExcel(filters: ReportFilters) {
    return this.http
      .get(`${this.base}/attendance/excel`, {
        params: this.toParams(filters),
        responseType: 'blob'
      })
      .pipe(tap((blob) => this.download(blob, `reporte-asistencia-${filters.type.toLowerCase()}.csv`)));
  }

  exportPdf(filters: ReportFilters) {
    return this.http
      .get(`${this.base}/attendance/pdf`, {
        params: this.toParams(filters),
        responseType: 'blob'
      })
      .pipe(tap((blob) => this.download(blob, `reporte-asistencia-${filters.type.toLowerCase()}.pdf`)));
  }

  getAlertStudents() {
    return this.http.get<AlertStudent[]>(`${environment.apiUrl}/alerts`);
  }

  private toParams(filters: ReportFilters): HttpParams {
    let params = new HttpParams().set('type', filters.type);
    if (filters.groupId) {
      params = params.set('groupId', filters.groupId);
    }
    if (filters.studentId) {
      params = params.set('studentId', filters.studentId);
    }
    if (filters.from) {
      params = params.set('from', filters.from);
    }
    if (filters.to) {
      params = params.set('to', filters.to);
    }
    if (filters.month) {
      params = params.set('month', filters.month);
    }
    return params;
  }

  private download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
