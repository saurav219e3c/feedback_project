import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerService } from '../service/manager_service';
import { Recognition } from '../../employee/service/employee.service';

@Component({
  selector: 'app-manager-recognition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-recognition.component.html'
})
export class ManagerRecognitionComponent implements OnInit {
  recognitions: Recognition[] = [];

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // We call the ManagerService to get the UNFILTERED raw data
    this.recognitions = this.managerService.getAllRecognitions();
    
    // Sort so the latest recognition is at the top
    this.recognitions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getBadgeTheme(badge: string, points: number) {
    const icons: Record<string, string> = {
      'Leader': 'bi-rocket-takeoff-fill',
      'Team Player': 'bi-people-fill',
      'Problem Solver': 'bi-cpu-fill',
      'Innovator': 'bi-lightbulb-fill'
    };

    let themeColor: string;
    if (points >= 8) themeColor = '#22c55e';      // Green
    else if (points >= 6) themeColor = '#f59e0b'; // Amber
    else themeColor = '#ef4444';                  // Red

    return {
      color: themeColor,
      icon: icons[badge] || 'bi-award-fill'
    };
  }
}