import { Component, inject, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { ConnectivityService } from '../../core/services/connectivity.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  readonly menuToggle = output<void>();
  private readonly auth = inject(AuthService);
  readonly connectivity = inject(ConnectivityService);
  readonly schoolName = environment.schoolName;
  readonly user = this.auth.currentUser;

  logout(): void {
    this.auth.logout();
  }
}
