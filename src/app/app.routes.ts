import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'groups',
        loadComponent: () =>
          import('./features/groups/group-list/group-list.component').then((m) => m.GroupListComponent)
      },
      {
        path: 'groups/:id',
        loadComponent: () =>
          import('./features/groups/group-detail/group-detail.component').then(
            (m) => m.GroupDetailComponent
          )
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./features/students/student-list/student-list.component').then(
            (m) => m.StudentListComponent
          )
      },
      {
        path: 'students/:id',
        loadComponent: () =>
          import('./features/students/student-profile/student-profile.component').then(
            (m) => m.StudentProfileComponent
          )
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('./features/attendance/attendance-select/attendance-select.component').then(
            (m) => m.AttendanceSelectComponent
          )
      },
      {
        path: 'attendance/:groupId',
        loadComponent: () =>
          import('./features/attendance/attendance-take/attendance-take.component').then(
            (m) => m.AttendanceTakeComponent
          )
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/attendance/attendance-history/attendance-history.component').then(
            (m) => m.AttendanceHistoryComponent
          )
      },
      {
        path: 'justifications',
        loadComponent: () =>
          import('./features/justifications/justification-list/justification-list.component').then(
            (m) => m.JustificationListComponent
          )
      },
      {
        path: 'justifications/new',
        loadComponent: () =>
          import('./features/justifications/justification-form/justification-form.component').then(
            (m) => m.JustificationFormComponent
          )
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then((m) => m.ReportsComponent)
      },
      {
        path: 'alerts',
        loadComponent: () =>
          import('./features/alerts/alerts.component').then((m) => m.AlertsComponent)
      },
      {
        path: 'class-schedule',
        loadComponent: () =>
          import('./features/schedules/class-schedule/class-schedule.component').then(
            (m) => m.ClassScheduleComponent
          )
      },
      {
        path: 'teacher-schedule',
        loadComponent: () =>
          import('./features/schedules/teacher-schedule/teacher-schedule.component').then(
            (m) => m.TeacherScheduleComponent
          )
      },
      {
        path: 'teacher-absences',
        loadComponent: () =>
          import('./features/schedules/teacher-absences/teacher-absences.component').then(
            (m) => m.TeacherAbsencesComponent
          )
      },
      {
        path: 'work-hours',
        loadComponent: () =>
          import('./features/schedules/work-hours/work-hours.component').then(
            (m) => m.WorkHoursComponent
          )
      },
      {
        path: 'cover-work',
        loadComponent: () =>
          import('./features/schedules/cover-work/cover-work.component').then(
            (m) => m.CoverWorkComponent
          )
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
