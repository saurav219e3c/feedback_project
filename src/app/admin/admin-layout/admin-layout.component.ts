
import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import {
  Router,
  NavigationEnd,
  RouterOutlet,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  isSidebarOpen = false;
  auth= inject(AuthService);
  constructor(private router: Router) {
    // Close sidebar on each route change (mobile-like UX on all screens)
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.isSidebarOpen = false;
      });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }
  logout() :void{
    this.auth.logout();
    this.router.navigate(['/auth/home-page']);
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.isSidebarOpen = false;
  }
}
