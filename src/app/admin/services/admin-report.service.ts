import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface SentimentDto {
  positive: number;
  neutral: number;
  negative: number;
}

export interface MonthlyTrendDto {
  labels: string[];
  feedback: number[];
  recognition: number[];
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
  score: number; // 0–10
}

export interface ActivityItemDto {
  time: string;
  user: string;
  action: string;
  details: string;
}

@Injectable({ providedIn: 'root' })
export class AdminReportService {
  private baseUrl = '/api/admin/reports'; // TODO: set your real base URL

  constructor(private http: HttpClient) {}

  getFeedbackSentiment(from?: string, to?: string): Observable<SentimentDto> {
    // const params = this.buildParams({ from, to });
    // return this.http.get<SentimentDto>(`${this.baseUrl}/feedback-sentiment`, { params });
    return of({ positive: 22, neutral: 8, negative: 5 });
  }

  getMonthlyTrend(from?: string, to?: string): Observable<MonthlyTrendDto> {
    // const params = this.buildParams({ from, to });
    // return this.http.get<MonthlyTrendDto>(`${this.baseUrl}/monthly-trend`, { params });
    return of({
      labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
      feedback: [40, 55, 42, 70, 64, 58],
      recognition: [20, 22, 25, 30, 35, 33]
    });
  }

  getDepartmentFeedbackCounts(from?: string, to?: string): Observable<DepartmentCountDto[]> {
    // const params = this.buildParams({ from, to });
    // return this.http.get<DepartmentCountDto[]>(`${this.baseUrl}/department-feedback-counts`, { params });
    return of([
      { department: 'IT', count: 120 },
      { department: 'HR', count: 65 },
      { department: 'Finance', count: 82 },
      { department: 'Sales', count: 140 },
      { department: 'Ops', count: 90 }
    ]);
  }

  getTopEmployeesByPoints(limit = 10, from?: string, to?: string): Observable<TopEmployeeDto[]> {
    // const params = this.buildParams({ from, to, limit: String(limit) });
    // return this.http.get<TopEmployeeDto[]>(`${this.baseUrl}/top-employees`, { params });
    return of([
      { employee: 'Amit Kumar', points: 88 },
      { employee: 'Nisha Verma', points: 81 },
      { employee: 'Rahul Singh', points: 76 },
      { employee: 'Priya Shah', points: 70 },
      { employee: 'Rohit Nair', points: 64 },
      { employee: 'Meena Iyer', points: 58 },
      { employee: 'Vivek Patil', points: 54 },
      { employee: 'Ankit Gupta', points: 51 },
      { employee: 'Sara Khan', points: 49 },
      { employee: 'John Mathews', points: 46 }
    ]);
  }

  getRecognitionGivenReceivedByDept(from?: string, to?: string): Observable<GivenReceivedDto[]> {
    // const params = this.buildParams({ from, to });
    // return this.http.get<GivenReceivedDto[]>(`${this.baseUrl}/department-given-received`, { params });
    return of([
      { department: 'IT', given: 80, received: 110 },
      { department: 'HR', given: 40, received: 45 },
      { department: 'Finance', given: 52, received: 60 },
      { department: 'Sales', given: 120, received: 130 },
      { department: 'Ops', given: 70, received: 75 }
    ]);
  }

  getCategoryAverageScores(from?: string, to?: string): Observable<CategoryScoreDto[]> {
    // const params = this.buildParams({ from, to });
    // return this.http.get<CategoryScoreDto[]>(`${this.baseUrl}/category-average-scores`, { params });
    return of([
      { category: 'Communication', score: 7.8 },
      { category: 'Leadership', score: 6.9 },
      { category: 'Teamwork', score: 8.2 },
      { category: 'Problem Solving', score: 7.1 },
      { category: 'Punctuality', score: 8.5 }
    ]);
  }

  getRecentActivities(limit = 20): Observable<ActivityItemDto[]> {
    // const params = this.buildParams({ limit: String(limit) });
    // return this.http.get<ActivityItemDto[]>(`${this.baseUrl}/recent-activities`, { params });
    return of([
      { time: '2 min ago', user: 'Amit', action: 'Gave Feedback', details: 'Communication' },
      { time: '10 min ago', user: 'Sara', action: 'Recognition Received', details: 'Teamwork (+7)' },
      { time: '1 hr ago', user: 'Nisha', action: 'Feedback Received', details: 'Leadership' },
      { time: '3 hr ago', user: 'Rahul', action: 'Recognition Given', details: 'Problem Solving (+5)' }
    ]);
  }

  private buildParams(obj: Record<string, string | undefined>) {
    let params = new HttpParams();
    Object.entries(obj).forEach(([k, v]) => { if (v) params = params.set(k, v); });
    return params;
  }
}