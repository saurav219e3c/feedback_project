import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { ADMIN_ROUTES } from '../admin/admin.routes';
import { loginGuard } from '../core/guards/login.guard';

export const AUTH_ROUTES: Routes = [
  
  { path: '', pathMatch: 'full', redirectTo: 'home-page' },

  // /auth/home-page - No guard, always accessible
  { path: 'home-page', component: HomePageComponent },

  // /auth/login-page?role=admin|manager|employee - Guard prevents access if logged in
  { path: 'login-page', component: LoginPageComponent },

  // /auth/register-page - Guard prevents access if logged in
  { path: 'register-page', component: RegisterPageComponent },
];
