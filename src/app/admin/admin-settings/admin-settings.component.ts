import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';





@Component({
  selector: 'app-admin-settings',
  imports: [],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.css'
})
export class AdminSettingsComponent {
  auth = inject(AuthService);
  router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/home-page']);
  
  }

}
