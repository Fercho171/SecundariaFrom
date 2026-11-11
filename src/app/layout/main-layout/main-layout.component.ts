import { Component, inject, signal, viewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, MatSidenavModule, HeaderComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  private readonly breakpoints = inject(BreakpointObserver);
  readonly sidenav = viewChild<MatSidenav>('sidenav');
  readonly isDesktop = toSignal(
    this.breakpoints.observe('(min-width: 960px)').pipe(map((state) => state.matches)),
    { initialValue: true }
  );
  readonly opened = signal(true);

  toggle(): void {
    if (this.isDesktop()) {
      this.opened.update((value) => !value);
      return;
    }
    void this.sidenav()?.toggle();
  }
}
