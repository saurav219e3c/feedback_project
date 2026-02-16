import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-employee-profile',
  imports: [CommonModule],
  templateUrl: './employee-profile.component.html',
  styleUrl: './employee-profile.component.css'
})
export class EmployeeProfileComponent implements OnInit {

 currentUser: User | null = null;
  stats = {
    feedbackGiven: 0,
    feedbackReceived: 0,
    recognitionsGiven: 0,
    recognitionsReceived: 0,
    totalPoints: 0
  };
  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService
  ) {}

   ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadStats();
      }
    });
  }

  loadStats(): void {
    this.stats.feedbackGiven = this.employeeService.getMySentFeedback().length;
    this.stats.feedbackReceived = this.employeeService.getMyReceivedFeedback().length;
    this.stats.recognitionsGiven = this.employeeService.getMySentRecognition().length;
    this.stats.recognitionsReceived = this.employeeService.getMyRecognitions().length;
    this.stats.totalPoints = this.employeeService.getMyRecognitions()
      .reduce((sum, rec) => sum + (rec.points || 0), 0);
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  

}
