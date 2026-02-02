
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  totalFeedback: number;
  totalRecognition: number;
}
export interface CategoryCount { category: string; count: number; }
export interface TypeDistribution { type: string; count: number; }
export interface MonthlyTrend { month: string; count: number; }
export interface ActivityItem { time: string; user: string; action: string; details: string; }

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {

  getSummary$(): Observable<DashboardSummary> {
    return of({ totalUsers: 125, activeUsers: 87, totalFeedback: 1240, totalRecognition: 310 }).pipe(delay(150));
  }

  getFeedbackByCategory$(): Observable<CategoryCount[]> {
    return of([
      { category: 'Communication',     count: 320 },
      { category: 'Teamwork',          count: 280 },
      { category: 'Technical Skills',  count: 240 },
      { category: 'Leadership',        count: 180 },
      { category: 'Time Management',   count: 120 },
      { category: 'Professionalism',   count: 100 },
    ]).pipe(delay(150));
  }

  getRecognitionByCategory$(): Observable<CategoryCount[]> {
    return of([
      { category: 'Teamwork',          count: 210 },
      { category: 'Leadership',        count: 160 },
      { category: 'Communication',     count: 150 },
      { category: 'Professionalism',   count: 120 },
      { category: 'Technical Skills',  count: 95  },
      { category: 'Time Management',   count: 70  },
    ]).pipe(delay(150));
  }

  getFeedbackTypeDistribution$(): Observable<TypeDistribution[]> {
    return of([
      { type: 'Positive',    count: 720 },
      { type: 'Neutral',     count: 350 },
      { type: 'Improvement', count: 170 },
    ]).pipe(delay(150));
  }

  getRecognitionTypeDistribution$(): Observable<TypeDistribution[]> {
    return of([
      { type: 'Appreciation', count: 210 },
      { type: 'Kudos',        count: 70  },
      { type: 'Shout-outs',   count: 30  },
    ]).pipe(delay(150));
  }

  getMonthlyFeedbackTrend$(): Observable<MonthlyTrend[]> {
    return of([
      { month: 'Jan', count: 60  },
      { month: 'Feb', count: 72  },
      { month: 'Mar', count: 81  },
      { month: 'Apr', count: 95  },
      { month: 'May', count: 110 },
      { month: 'Jun', count: 96  },
    ]).pipe(delay(150));
  }

  getMonthlyRecognitionTrend$(): Observable<MonthlyTrend[]> {
    return of([
      { month: 'Jan', count: 30  },
      { month: 'Feb', count: 42  },
      { month: 'Mar', count: 55  },
      { month: 'Apr', count: 64  },
      { month: 'May', count: 70  },
      { month: 'Jun', count: 61  },
    ]).pipe(delay(150));
  }

  getActivityLog$(): Observable<ActivityItem[]> {
    return of([
      { time: '2 min ago',  user: 'Amit',  action: 'Gave Feedback',    details: 'Communication' },
      { time: '10 min ago', user: 'Admin', action: 'Disabled Category',details: 'Time Management' },
      { time: '1 hr ago',   user: 'Neha',  action: 'Sent Recognition', details: 'Team Player' },
      { time: 'Today',      user: 'Ravi',  action: 'Gave Feedback',    details: 'Leadership' },
      { time: 'Today',      user: 'Priya', action: 'Updated Settings', details: 'Email templates' },
    ]).pipe(delay(150));
  }
}
