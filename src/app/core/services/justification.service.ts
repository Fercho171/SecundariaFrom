import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Justification, JustificationRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class JustificationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/justifications`;

  getJustifications() {
    return this.http.get<Justification[]>(this.base);
  }

  create(request: JustificationRequest) {
    const formData = new FormData();
    formData.append('studentId', request.studentId);
    formData.append('date', request.date);
    formData.append('reason', request.reason);
    formData.append('notes', request.notes ?? '');
    if (request.file) {
      formData.append('file', request.file, request.file.name);
    }
    return this.http.post<Justification>(this.base, formData);
  }
}
