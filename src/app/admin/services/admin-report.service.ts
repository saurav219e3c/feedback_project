import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';

export interface SentimentDto {
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  totalCount: number;
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
}

export interface WeeklyTrendDto {
  labels: string[];           // ["Week 1", "Week 2", "Week 3", "Week 4"]
  feedbackCounts: number[];   // Feedback counts per week
  recognitionCounts: number[]; // Recognition counts per week
  year: number;               // Year of the data
  month: number;              // Month of the data (1-12)
}

export interface DepartmentCountDto {
  department: string;
  count: number;
}

export interface TopEmployeeDto {
  employee: string;
  points: number;
}

export interface GivenReceivedDto {
  department: string;
  given: number;
  received: number;
}

export interface CategoryScoreDto {
  category: string;
  score: number;
}

export interface ActivityItemDto {
  time: string;
  user: string;
  action: string;
  details: string;
}

@Injectable({ providedIn: 'root' })
export class AdminReportService {
  constructor(private http: HttpClient, private api: ApiService) {}

  getFeedbackSentiment(from?: string, to?: string, departmentId?: string): Observable<SentimentDto> {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (departmentId) params.departmentId = departmentId;
    return this.api.get<SentimentDto>('/api/insight/sentiment/stats', params);
  }

  getWeeklyTrend(year: number, month: number): Observable<WeeklyTrendDto> {
    return this.api.get<WeeklyTrendDto>('/api/dashboard/weekly-trends', { year, month });
  }

  getDepartmentFeedbackCounts(from?: string, to?: string): Observable<DepartmentCountDto[]> {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.api.get<any[]>('/api/dashboard/department-feedback-counts', params).pipe(
      map((items: any[]) => (items ?? []).map(item => ({
        department: item.departmentName ?? 'Unknown',
        count: item.count ?? 0
      })))
    );
  }

  getTopEmployeesByPoints(limit = 10, from?: string, to?: string): Observable<TopEmployeeDto[]> {
    const params: any = { limit };
    if (from) params.from = from;
    if (to) params.to = to;
    return this.api.get<any[]>('/api/dashboard/top-employees', params).pipe(
      map((items: any[]) => (items ?? []).map(item => ({
        employee: item.fullName ?? 'Unknown',
        points: item.points ?? 0
      })))
    );
  }

  getRecognitionGivenReceivedByDept(from?: string, to?: string): Observable<GivenReceivedDto[]> {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.api.get<any[]>('/api/dashboard/department-recognition-stats', params).pipe(
      map((items: any[]) => (items ?? []).map(item => ({
        department: item.departmentName ?? 'Unknown',
        given: item.givenCount ?? 0,
        received: item.receivedCount ?? 0
      })))
    );
  }

  getCategoryAverageScores(from?: string, to?: string): Observable<CategoryScoreDto[]> {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.api.get<any[]>('/api/dashboard/category-average-scores', params).pipe(
      map((items: any[]) => (items ?? []).map(item => ({
        category: item.categoryName ?? 'Unknown',
        score: item.averageScore ?? 0
      })))
    );
  }

  getRecentActivities(limit = 20): Observable<ActivityItemDto[]> {
    return this.api.get<ActivityItemDto[]>('/api/activity/logs');
  }
}