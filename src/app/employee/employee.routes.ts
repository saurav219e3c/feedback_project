import { Routes } from "@angular/router";
import { EmployeeDashboardComponent } from "./employee-dashboard/employee-dashboard.component";
import { EmployeeFeedbackComponent } from "./employee-feedback/employee-feedback.component";
import { EmployeeNotificationComponent } from "./employee-notification/employee-notification.component";
import { EmployeeRecognitionComponent } from "./employee-recognition/employee-recognition.component";
import { SubmitFeedbackComponent } from './submit-feedback/submit-feedback.component';
import { EmployeeLayoutComponent } from "./employee-layout/employee-layout.component";
import { ReceivedRecognitionComponent } from "./received-recognition/received-recognition.component";
import { authGuard } from "../core/guards/auth.guard";
import { roleGuard } from "../core/guards/role.guard";

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    component: EmployeeLayoutComponent,
    canActivate:[authGuard,roleGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
      { path: 'dashboard', component: EmployeeDashboardComponent },
      { path: 'feedback', component: SubmitFeedbackComponent},
      { path: 'notifications', component: EmployeeNotificationComponent },
      { path: 'recognition', component: EmployeeRecognitionComponent },
      {path: 'received-recognition',component:ReceivedRecognitionComponent},
      {path: 'recivedfeedback',component:EmployeeFeedbackComponent},
      {path:'**', redirectTo:'dashboard', pathMatch:'full'}
    ]
  }
];