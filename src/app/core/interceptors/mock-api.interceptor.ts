import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AttendanceBatchRequest,
  AttendanceFilters,
  AttendanceStatus,
  JustificationReason,
  LoginRequest,
  ReportFilters,
  ReportType,
  Weekday
} from '../models';
import { MockStore } from '../mock/mock-store';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMockApi) {
    return next(req);
  }

  const path = extractApiPath(req.url);
  if (path === null) {
    return next(req);
  }

  try {
    const store = inject(MockStore);
    const url = new URL(req.url, 'http://local.mock');
    const body = handle(store, req.method, path, url.searchParams, req.body);
    return of(new HttpResponse({ status: 200, body }));
  } catch (error) {
    const parsed = error as { status?: number; message?: string };
    return throwError(
      () =>
        new HttpErrorResponse({
          status: parsed.status ?? 500,
          statusText: 'Mock Error',
          error: { message: parsed.message ?? 'Error inesperado.' },
          url: req.url
        })
    );
  }
};

function extractApiPath(url: string): string | null {
  const absoluteBase = environment.apiUrl;
  if (url.startsWith(absoluteBase)) {
    return url.substring(absoluteBase.length).split('?')[0] || '/';
  }

  const marker = '/api';
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return url.substring(index + marker.length).split('?')[0] || '/';
}

function handle(
  store: MockStore,
  method: string,
  path: string,
  params: URLSearchParams,
  body: unknown
): unknown {
  if (method === 'POST' && path === '/auth/login') {
    return store.login(body as LoginRequest);
  }
  if (method === 'GET' && path === '/dashboard') {
    return store.getDashboard();
  }
  if (method === 'GET' && path === '/alerts') {
    return store.getAlerts();
  }
  if (method === 'GET' && path === '/groups') {
    return store.getGroups();
  }

  const groupStudents = path.match(/^\/groups\/([^/]+)\/students$/);
  if (method === 'GET' && groupStudents) {
    return store.getGroupStudents(groupStudents[1]);
  }
  const groupOne = path.match(/^\/groups\/([^/]+)$/);
  if (method === 'GET' && groupOne) {
    return store.getGroup(groupOne[1]);
  }

  if (method === 'GET' && path === '/students') {
    return store.getStudents(params.get('search') ?? undefined, params.get('groupId') ?? undefined);
  }
  const studentOne = path.match(/^\/students\/([^/]+)$/);
  if (method === 'GET' && studentOne) {
    return store.getStudent(studentOne[1]);
  }

  if (method === 'POST' && path === '/attendance') {
    return store.saveAttendance(body as AttendanceBatchRequest);
  }
  const attendanceStudent = path.match(/^\/attendance\/student\/([^/]+)$/);
  if (method === 'GET' && attendanceStudent) {
    return store.getAttendance({ studentId: attendanceStudent[1] });
  }
  const attendanceGroup = path.match(/^\/attendance\/group\/([^/]+)$/);
  if (method === 'GET' && attendanceGroup) {
    return store.getAttendance({
      groupId: attendanceGroup[1],
      date: params.get('date') ?? undefined
    });
  }
  const attendanceOne = path.match(/^\/attendance\/([^/]+)$/);
  if (method === 'PUT' && attendanceOne) {
    const status = (body as { status: AttendanceStatus }).status;
    return store.updateAttendance(attendanceOne[1], status);
  }
  if (method === 'GET' && path === '/attendance') {
    const filters: AttendanceFilters = {
      studentId: params.get('studentId') ?? undefined,
      groupId: params.get('groupId') ?? undefined,
      from: params.get('from') ?? undefined,
      to: params.get('to') ?? undefined,
      status: (params.get('status') as AttendanceStatus | null) ?? undefined,
      date: params.get('date') ?? undefined
    };
    return store.getAttendance(filters);
  }

  if (method === 'GET' && path === '/justifications') {
    return store.getJustifications();
  }
  if (method === 'POST' && path === '/justifications') {
    const form = body as FormData;
    const file = form.get('file');
    return store.createJustification({
      studentId: String(form.get('studentId')),
      date: String(form.get('date')),
      reason: String(form.get('reason')) as JustificationReason,
      notes: String(form.get('notes') ?? ''),
      fileName: file instanceof File ? file.name : undefined
    });
  }

  if (method === 'GET' && path === '/reports/attendance') {
    return store.getReport(reportFilters(params));
  }
  if (method === 'GET' && path === '/reports/attendance/excel') {
    return toCsv(store.getReport(reportFilters(params)));
  }
  if (method === 'GET' && path === '/reports/attendance/pdf') {
    return toPdf(store.getReport(reportFilters(params)));
  }

  if (method === 'GET' && path === '/teachers') {
    return store.getTeachers();
  }
  if (method === 'GET' && path === '/schedules/periods') {
    return store.getPeriods();
  }
  if (method === 'GET' && path === '/schedules/classes') {
    return store.getClassSchedule(
      (params.get('weekday') as Weekday | null) ?? undefined,
      params.get('groupId') ?? undefined
    );
  }
  if (method === 'GET' && path === '/schedules/teachers') {
    return store.getTeacherSchedules();
  }
  const teacherSchedule = path.match(/^\/schedules\/teachers\/([^/]+)$/);
  if (method === 'GET' && teacherSchedule) {
    return store.getTeacherSchedule(teacherSchedule[1]);
  }
  if (method === 'GET' && path === '/schedules/absences') {
    return store.getTeacherAbsences(params.get('date') ?? undefined);
  }
  if (method === 'GET' && path === '/schedules/work-hours') {
    return store.getWorkHours();
  }
  if (method === 'GET' && path === '/schedules/uncovered-hours') {
    return store.getUncoveredHours(params.get('date') ?? undefined);
  }
  if (method === 'GET' && path === '/schedules/cover-work') {
    return store.getCoverAssignments(params.get('date') ?? undefined);
  }
  if (method === 'POST' && path === '/schedules/cover-work') {
    const form = body as FormData;
    const file = form.get('file');
    if (!(file instanceof File)) {
      throw { status: 400, message: 'Adjunta un archivo PDF, imagen, Word o Excel.' };
    }
    return store.createCoverAssignment({
      title: String(form.get('title')),
      date: String(form.get('date')),
      groupId: String(form.get('groupId')),
      periodId: Number(form.get('periodId')),
      absentTeacherName: String(form.get('absentTeacherName') ?? ''),
      subject: String(form.get('subject') ?? ''),
      instructions: String(form.get('instructions') ?? ''),
      file
    });
  }
  const coverFile = path.match(/^\/schedules\/cover-work\/([^/]+)\/file$/);
  if (method === 'GET' && coverFile) {
    const file = store.downloadCoverFile(coverFile[1]);
    return file.blob;
  }

  throw { status: 404, message: 'No se encontró la información solicitada.' };
}

function reportFilters(params: URLSearchParams): ReportFilters {
  return {
    type: (params.get('type') as ReportType) ?? 'DAILY',
    groupId: params.get('groupId') ?? undefined,
    studentId: params.get('studentId') ?? undefined,
    from: params.get('from') ?? undefined,
    to: params.get('to') ?? undefined,
    month: params.get('month') ?? undefined
  };
}

function toCsv(report: ReturnType<MockStore['getReport']>): Blob {
  const header = 'Fecha,Alumno,Grupo,Estado,Faltas,Porcentaje,Docente';
  const lines = report.rows.map((row) =>
    [row.date ?? '', row.studentName, row.groupName, row.status ?? '', row.absences ?? '', row.percentage ?? '', row.teacherName ?? '']
      .map((value) => `"${value}"`)
      .join(',')
  );
  return new Blob([`\uFEFF${header}\n${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
}

function toPdf(report: ReturnType<MockStore['getReport']>): Blob {
  const title = `Reporte de asistencia ${report.type}`;
  const summary = `Total ${report.summary.total} | Presentes ${report.summary.presents} | Faltas ${report.summary.absences}`;
  const content = `BT /F1 16 Tf 50 750 Td (${title}) Tj 0 -24 Td /F1 11 Tf (${summary}) Tj ET`;
  const pdf = `%PDF-1.1
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${content.length} >> stream
${content}
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
trailer << /Root 1 0 R >>
%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}
