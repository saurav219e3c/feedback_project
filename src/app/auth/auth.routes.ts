import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { ADMIN_ROUTES } from '../admin/admin.routes';
import { loginGuard } from '../core/guards/login.guard';

export const AUTH_ROUTES: Routes = [
  
  { path: '', pathMatch: 'full', redirectTo: 'home-page' },

  
  { path: 'home-page',canMatch: [loginGuard], component: HomePageComponent },

  // /auth/login-page?role=admin|manager|employee
  { path: 'login-page',canMatch: [loginGuard], component: LoginPageComponent },

  // /auth/register-page
  { path: 'register-page',canMatch: [loginGuard], component: RegisterPageComponent },
];
