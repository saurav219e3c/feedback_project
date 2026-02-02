import { Routes } from "@angular/router";
import { EmployeeDashboardComponent } from "./pages/employee-dashboard/employee-dashboard.component";
import { EmployeeFeedbackComponent } from "./pages/employee-received-feedback/employee-feedback.component";
import { EmployeeNotificationComponent } from "./pages/employee-notification/employee-notification.component";
import { EmployeeRecognitionComponent } from "./pages/employee-recognition/employee-recognition.component";
import { SubmitFeedbackComponent } from './pages/submit-feedback/submit-feedback.component';
import { EmployeeLayoutComponent } from "./layout/employee-layout/employee-layout.component";
import { ReceivedRecognitionComponent } from "./received-recognition/received-recognition.component";
import { authGuard } from "../../core/guards/auth.guard";
import { roleGuard } from "../../core/guards/role.guard";

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
      {path:'**', redirectTo:'dashboard', pathMatch:'full'},
      
    ]
  }
];