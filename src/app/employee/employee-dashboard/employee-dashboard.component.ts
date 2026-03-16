import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../service/employee.service';

export interface DashboardStat {
  label: string;
  value: number;
  trend: number;
  icon: string;
  bgClass: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css'
})
export class EmployeeDashboardComponent implements OnInit {

  //inject service 

  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);

 

   stats: any[] = [];

   today = new Date();


  //varibale for dynamic name display
  name: string = 'Guest'; 

  constructor() { }

  ngOnInit(): void {

    this.authService.user$.subscribe(user => {
      if (user) {
        this.name = user.name || 'Guest';
      }
    });

    //for the load dashboards stats 

    this.employeeService.getDasboardStats().subscribe(data => {
      this.stats = data;
    });

  }
}