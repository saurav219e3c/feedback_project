
import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './auth/auth.routes';
import { EMPLOYEE_ROUTES } from './employee/employee.routes';
import { ADMIN_ROUTES } from './admin/admin.routes';
import { managerRoutes } from './manager/manager.routes'

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/home-page' }, 

  { path: 'auth', children: AUTH_ROUTES },
  { path: 'employee', children: EMPLOYEE_ROUTES },
  { path: 'admin', children: ADMIN_ROUTES },
  { path: 'manager', children: managerRoutes },

  { path: '**', redirectTo: 'auth/home-page' }, 
];

