import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmployeeService, Recognition } from '../service/employee.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-received-recognition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './received-recognition.component.html',
  styleUrl: './received-recognition.component.css'
})
export class ReceivedRecognitionComponent implements OnInit {

  constructor(private empService: EmployeeService) { }

  //Signal
  rawRecognitions = signal<Recognition[]>([]);

  
  recognitionView = computed(() => {

    const raw = this.rawRecognitions();

    return raw.map(item => ({
      ...item,
      senderName: this.empService.getEmployeeName(item.fromUserId),
      receivedName: this.empService.getEmployeeName(item.toUserId)
    }));
  });

  ngOnInit(): void {
    // Load Data DIRECTLY into the Signal
    const data = this.empService.getMyRecognitions();
    this.rawRecognitions.set(data);
  }


  getBadgeTheme(badge: string, points: number) {
    const icons: Record<string, string> = {
      'Leader': 'bi-rocket-takeoff-fill',
      'Team Player': 'bi-people-fill',
      'Problem Solver': 'bi-cpu-fill',
      'Innovator': 'bi-lightbulb-fill',
      'Rising Star': 'bi-star-fill',
      'Spot Award': 'bi-trophy-fill'
    };

    let themeColor: string;

    if (points >= 8) {
      themeColor = '#2ed573'; // Green
    } else if (points >= 6) {
      themeColor = '#ffa502'; // Yellow/Orange
    } else {
      themeColor = '#ff4757'; // Red
    }

    return {
      color: themeColor,
      icon: icons[badge] || 'bi-award'
    };
  }
}