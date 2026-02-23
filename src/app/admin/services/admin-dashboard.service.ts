
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';

export interface DashboardSummary {
  totalUsers: number;
  activeUsers: number;
  totalFeedback: number;
  totalRecognition: number;
}

export interface SentimentStats {
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  totalCount: number;
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
}

export interface CategoryCount { category: string; count: number; }
export interface TypeDistribution { type: string; count: number; }
export interface WeeklyTrend { 
  labels: string[];           // ["Week 1", "Week 2", "Week 3", "Week 4"]
  feedbackCounts: number[];   // Feedback counts per week
  recognitionCounts: number[]; // Recognition counts per week
  year: number;               // Year of the data
  month: number;              // Month of the data (1-12)
}
export interface ActivityItem { time: string; user: string; action: string; details: string; }

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {

  constructor(private api: ApiService) {}

  // Get sentiment statistics
  getSentimentStats(from?: Date, to?: Date, departmentId?: string): Observable<SentimentStats> {
    const params: any = {};
    if (from) params.from = from.toISOString();
    if (to) params.to = to.toISOString();
    if (departmentId) params.departmentId = departmentId;

    return this.api.get<SentimentStats>('/api/insight/sentiment/stats', params);
  }

  getSummary$(): Observable<DashboardSummary> {
    return this.api.get<DashboardSummary>('/api/dashboard/summary');
  }

  getFeedbackByCategory$(): Observable<CategoryCount[]> {
    return this.api.get<any[]>('/api/dashboard/feedback-by-category').pipe(
      map((items: any[]) => items.map(item => ({
        category: item.categoryName,
        count: item.feedbackCount
      })))
    );
  }

  getRecognitionByCategory$(): Observable<CategoryCount[]> {
    return this.api.get<any[]>('/api/dashboard/recognition-by-badge').pipe(
      map((items: any[]) => items.map(item => ({
        category: item.badgeName || item.categoryName,
        count: item.recognitionCount || item.count
      })))
    );
  }

  getFeedbackTypeDistribution$(): Observable<TypeDistribution[]> {
    // Using sentiment stats for type distribution
    return this.getSentimentStats().pipe(
      map(stats => [
        { type: 'Positive', count: stats.positiveCount },
        { type: 'Neutral', count: stats.neutralCount },
        { type: 'Negative', count: stats.negativeCount },
      ])
    );
  }

  getRecognitionTypeDistribution$(): Observable<TypeDistribution[]> {
    // Mock data for now - can be enhanced later
    return of([
      { type: 'Appreciation', count: 210 },
      { type: 'Kudos',        count: 70  },
      { type: 'Shout-outs',   count: 30  },
    ]).pipe(delay(150));
  }

  getWeeklyTrend$(year: number, month: number): Observable<WeeklyTrend> {
    return this.api.get<WeeklyTrend>('/api/dashboard/weekly-trends', { year, month });
  }

  getActivityLog$(): Observable<ActivityItem[]> {
    return this.api.get<ActivityItem[]>('/api/activity/logs');
  }
}
