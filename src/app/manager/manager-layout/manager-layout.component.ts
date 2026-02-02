import { Component, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service'; 
import { User } from '../../core/models/user.model'; 

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [ 
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './manager-layout.component.html',
  styleUrls: ['./manager-layout.component.css']
})
export class ManagerLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private sub = new Subscription();

  isSidebarOpen = false;
  isProfileOpen = false;
  notificationCount = 2;
  currentUser: User | null = null;

  constructor() {
    // Auto-close sidebar/popup on navigation
    this.sub.add(
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(() => {
          if (!this.isDesktop()) this.isSidebarOpen = false;
          this.isProfileOpen = false;
        })
    );
  }

  ngOnInit(): void {
    // Reactively update user details (Name, Email, ID) from the Service/Token
    this.sub.add(
      this.authService.user$.subscribe(user => {
        this.currentUser = user;
        // Optional: Redirect to login if user becomes null (token expires/logout)
        if (!user) {
          this.router.navigate(['/login']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onLogout(): void {
    this.authService.logout(); // Clears localStorage via TokenService
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  toggleProfile(): void {
    this.isProfileOpen = !this.isProfileOpen;
  }

  getInitials(name: string | undefined): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.profile-container')) {
      this.isProfileOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.isSidebarOpen = false;
    this.isProfileOpen = false;
  }

  private isDesktop(): boolean {
    return window.matchMedia('(min-width: 1400px)').matches;
  }
}