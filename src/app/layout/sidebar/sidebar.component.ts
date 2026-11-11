import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly items = [
    { path: '/dashboard', icon: 'home', label: 'Inicio' },
    { path: '/attendance', icon: 'fact_check', label: 'Pasar lista' },
    { path: '/groups', icon: 'groups', label: 'Grupos' },
    { path: '/students', icon: 'school', label: 'Alumnos' },
    { path: '/class-schedule', icon: 'calendar_view_week', label: 'Horario clases' },
    { path: '/teacher-schedule', icon: 'badge', label: 'Horario docentes' },
    { path: '/teacher-absences', icon: 'event_busy', label: 'Faltantes docentes' },
    { path: '/cover-work', icon: 'folder_open', label: 'Trabajos sin maestro' },
    { path: '/work-hours', icon: 'schedule', label: 'Horas de trabajo' },
    { path: '/history', icon: 'history', label: 'Historial' },
    { path: '/justifications', icon: 'assignment', label: 'Justificaciones' },
    { path: '/reports', icon: 'assessment', label: 'Reportes' },
    { path: '/alerts', icon: 'warning', label: 'Seguimiento' }
  ];
}
