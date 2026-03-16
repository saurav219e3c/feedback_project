
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section style="text-align:center; padding:2rem;">
      <h2>403 – Forbidden</h2>
      <p>You don't have permission to access this area.</p>
      <a routerLink="/auth/login-page">Go to Login</a>
    </section>
  `
})
export class ForbiddenComponent {}
