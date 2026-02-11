import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,                 // <-- ADD THIS
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'] // <-- Also fix styleUrls
})
export class HomePageComponent {
  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  get isLoggedIn$() {
    return this.auth.isLoggedIn$;
  }

  scrollToAbout(): void {
    const element = document.getElementById('about-anchor');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToRoles(): void {
    const element = document.getElementById('roles-anchor');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/home-page']);
  }
}