import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { ADMIN_ROUTES } from '../admin/admin.routes';
import { loginGuard } from '../core/guards/login.guard';

export const AUTH_ROUTES: Routes = [
  
  { path: '', pathMatch: 'full', redirectTo: 'home-page' },

  // /auth/home-page
  { path: 'home-page', component: HomePageComponent },

  // /auth/login-page?role=admin|manager|employee
  { path: 'login-page', component: LoginPageComponent },

  // /auth/register-page
  { path: 'register-page', component: RegisterPageComponent },
];
