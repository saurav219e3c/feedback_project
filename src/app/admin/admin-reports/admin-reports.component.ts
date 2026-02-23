import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AdminReportService,
  SentimentDto,
  DepartmentCountDto,
  TopEmployeeDto,
  GivenReceivedDto,
  CategoryScoreDto,
  WeeklyTrendDto
} from '../services/admin-report.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent implements OnInit {
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  loading = true;
  errors: string[] = [];

  // Month selection for weekly trends
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1; // 1-12
  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  get error(): string | null {
    return this.errors.length > 0 ? this.errors.join(', ') : null;
  }

  doughnutConfig: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [{ data: [0, 0, 0], backgroundColor: ['#22c55e', '#94a3b8', '#ef4444'], borderColor: '#fff', borderWidth: 2 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } }
    }
  };

  lineConfig: ChartConfiguration<'line'> = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: 'Feedback', data: [], tension: 0.35, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.2)', fill: true, pointRadius: 4 },
        { label: 'Recognition', data: [], tension: 0.35, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)', fill: true, pointRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.08)' } }, x: { grid: { display: false } } }
    }
  };

  deptBarConfig: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Feedback', data: [], backgroundColor: '#6366f1' }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
    }
  };

  topEmpConfig: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Points', data: [], backgroundColor: '#f59e0b' }] },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true }, y: { grid: { display: false } } }
    }
  };

  stackedDeptConfig: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        { label: 'Given', data: [], backgroundColor: '#0ea5e9', stack: 'stack1' },
        { label: 'Received', data: [], backgroundColor: '#10b981', stack: 'stack1' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
    }
  };

  radarConfig: ChartConfiguration<'radar'> = {
    type: 'radar',
    data: { labels: [], datasets: [{ label: 'Avg Score', data: [], backgroundColor: 'rgba(99,102,241,0.2)', borderColor: '#6366f1', pointBackgroundColor: '#6366f1' }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { r: { suggestedMin: 0, suggestedMax: 10, grid: { color: 'rgba(0,0,0,0.08)' } } },
      plugins: { legend: { position: 'bottom' } }
    }
  };

  activities: { time: string; user: string; action: string; details: string }[] = [];

  constructor(private reports: AdminReportService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  onMonthChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedMonth = parseInt(target.value, 10);
    this.loadWeeklyTrend();
  }

  onYearChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedYear = parseInt(target.value, 10);
    this.loadWeeklyTrend();
  }

  private loadWeeklyTrend() {
    this.reports.getWeeklyTrend(this.selectedYear, this.selectedMonth).pipe(
      catchError(err => { console.error('Weekly trend error:', err); this.errors.push('Weekly Trend'); return of(null); })
    ).subscribe(trend => {
      if (trend) {
        this.lineConfig.data.labels = trend.labels;
        this.lineConfig.data.datasets[0].data = trend.feedbackCounts;
        this.lineConfig.data.datasets[1].data = trend.recognitionCounts;
        setTimeout(() => {
          this.charts?.forEach(c => c.update());
        });
      }
    });
  }

  private loadAll() {
    this.loading = true;
    this.errors = [];

    forkJoin({
      sentiment: this.reports.getFeedbackSentiment().pipe(
        catchError(err => { console.error('Sentiment error:', err); this.errors.push('Sentiment'); return of(null); })
      ),
      deptCounts: this.reports.getDepartmentFeedbackCounts().pipe(
        catchError(err => { console.error('Dept counts error:', err); this.errors.push('Dept Feedback'); return of(null); })
      ),
      topEmployees: this.reports.getTopEmployeesByPoints(10).pipe(
        catchError(err => { console.error('Top employees error:', err); this.errors.push('Top Employees'); return of(null); })
      ),
      givenReceived: this.reports.getRecognitionGivenReceivedByDept().pipe(
        catchError(err => { console.error('Given/received error:', err); this.errors.push('Given/Received'); return of(null); })
      ),
      catScores: this.reports.getCategoryAverageScores().pipe(
        catchError(err => { console.error('Category scores error:', err); this.errors.push('Category Scores'); return of(null); })
      ),
      activities: this.reports.getRecentActivities(20).pipe(
        catchError(err => { console.error('Activities error:', err); this.errors.push('Activities'); return of(null); })
      )
    }).subscribe(results => {
      // Sentiment doughnut
      if (results.sentiment) {
        const s = results.sentiment;
        this.doughnutConfig.data.datasets[0].data = [s.positiveCount, s.neutralCount, s.negativeCount];
      }

      // Department feedback bar
      if (results.deptCounts) {
        this.deptBarConfig.data.labels = results.deptCounts.map(r => r.department);
        this.deptBarConfig.data.datasets[0].data = results.deptCounts.map(r => r.count);
      }

      // Top employees bar
      if (results.topEmployees) {
        this.topEmpConfig.data.labels = results.topEmployees.map(r => r.employee);
        this.topEmpConfig.data.datasets[0].data = results.topEmployees.map(r => r.points);
      }

      // Given/received stacked bar
      if (results.givenReceived) {
        this.stackedDeptConfig.data.labels = results.givenReceived.map(r => r.department);
        this.stackedDeptConfig.data.datasets[0].data = results.givenReceived.map(r => r.given);
        this.stackedDeptConfig.data.datasets[1].data = results.givenReceived.map(r => r.received);
      }

      // Category average scores radar
      if (results.catScores) {
        this.radarConfig.data.labels = results.catScores.map(r => r.category);
        this.radarConfig.data.datasets[0].data = results.catScores.map(r => r.score);
      }

      // Activities table
      if (results.activities) {
        this.activities = results.activities;
      }

      // Update all charts after data is set
      setTimeout(() => {
        this.charts?.forEach(c => c.update());
      });

      this.loading = false;
    });

    // Load weekly trend separately with selected month/year
    this.loadWeeklyTrend();
  }
}