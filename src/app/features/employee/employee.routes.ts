import { Routes } from "@angular/router";
import { EmployeeDashboardComponent } from "./pages/dashboard/employee-dashboard.component";
import { EmployeeFeedbackComponent } from "./pages/received-feedback/employee-feedback.component";
import { EmployeeNotificationComponent } from "./pages/notifications/employee-notification.component";
import { EmployeeRecognitionComponent } from "./pages/submit-recognition/employee-recognition.component";
import { SubmitFeedbackComponent } from './pages/submit-feedback/submit-feedback.component';
import { EmployeeLayoutComponent } from "./layout/employee-layout/employee-layout.component";
import { ReceivedRecognitionComponent } from "./pages/received-recognition/received-recognition.component";
import { authGuard } from "../../core/guards/auth.guard";
import { roleGuard } from "../../core/guards/role.guard";
import { EmployeeProfileComponent } from "./pages/employee-profile/employee-profile.component";

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
      { path: 'profile', component: EmployeeProfileComponent },
      {path: 'recivedfeedback',component:EmployeeFeedbackComponent},
      {path:'**', redirectTo:'dashboard', pathMatch:'full'}
    ]
  }
];