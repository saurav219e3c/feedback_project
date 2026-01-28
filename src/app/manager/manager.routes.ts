import { Component } from '@angular/core';
import { Route, Routes } from '@angular/router';
import { ManagerLayoutComponent } from './manager-layout/manager-layout.component';
import { ManagerDashboardComponent } from './manager-dashboard/manager-dashboard.component';
import { ManagerAnalyticsComponent } from './manager-analytics/manager-analytics.component';
import { ManagerFeedbackComponent } from './manager-feedback/manager-feedback.component';
import { ManagerProfileComponent } from './manager-profile/manager-profile.component';
import { ManagerNotificationComponent } from './manager-notification/manager-notification.component';
import { ManagerRecognitionComponent } from './manager-recognition/manager-recognition.component';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';
export const managerRoutes: Routes = [
  {
    path: '',
    component: ManagerLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Manager'] },
    children: [
      {
        path: '',
        component: ManagerDashboardComponent,
      },
      {
        path: 'analytics',
        component: ManagerAnalyticsComponent,
      },
      {
        path: 'feedback',
        component: ManagerFeedbackComponent,
      },
      {
        path: 'profile',
        component: ManagerProfileComponent,
      },
      {
        path: 'notifications',
        component: ManagerNotificationComponent,
      },
      {
        path: 'recognitions',
        component: ManagerRecognitionComponent,
      },
      {
        path: '**',
        component: ManagerDashboardComponent,
      },
    ],
  },
];
