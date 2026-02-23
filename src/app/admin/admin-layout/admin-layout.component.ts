
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
import Swal from 'sweetalert2';

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
    Swal.fire({
      title: 'Logout Confirmation',
      text: 'Do you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        this.auth.logout();
        Swal.fire({
          title: 'Logged Out!',
          text: 'Logout successful',
          icon: 'success',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/auth/home-page']);
        });
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.isSidebarOpen = false;
  }
}
