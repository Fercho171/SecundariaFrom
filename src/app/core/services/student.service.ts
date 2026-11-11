import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Student, StudentProfile } from '../models';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/students`;

  getStudents(filters?: { search?: string; groupId?: string }) {
    let params = new HttpParams();
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.groupId) {
      params = params.set('groupId', filters.groupId);
    }
    return this.http.get<Student[]>(this.base, { params });
  }

  getStudentById(id: string) {
    return this.http.get<StudentProfile>(`${this.base}/${id}`);
  }
}
