import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import {
  AdminReportService,
  SentimentDto,
  DepartmentCountDto,
  TopEmployeeDto,
  GivenReceivedDto,
  CategoryScoreDto,
  MonthlyTrendDto
} from '../services/admin-report.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent implements OnInit {
  loading = true;
  error: string | null = null;

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
        { label: 'Feedback', data: [], tension: 0.35, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.2)', fill: true, pointRadius: 3 },
        { label: 'Recognition', data: [], tension: 0.35, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)', fill: true, pointRadius: 3 }
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

  private loadAll() {
    this.loading = true;
    this.error = null;

    this.reports.getFeedbackSentiment().subscribe({
      next: (s: SentimentDto) => { this.doughnutConfig.data.datasets[0].data = [s.positive, s.neutral, s.negative]; },
      error: () => this.error = 'Failed to load sentiment'
    });

    this.reports.getMonthlyTrend().subscribe({
      next: (t: MonthlyTrendDto) => {
        this.lineConfig.data.labels = t.labels;
        this.lineConfig.data.datasets[0].data = t.feedback;
        this.lineConfig.data.datasets[1].data = t.recognition;
      },
      error: () => this.error = 'Failed to load monthly trend'
    });

    this.reports.getDepartmentFeedbackCounts().subscribe({
      next: (rows: DepartmentCountDto[]) => {
        this.deptBarConfig.data.labels = rows.map(r => r.department);
        this.deptBarConfig.data.datasets[0].data = rows.map(r => r.count);
      },
      error: () => this.error = 'Failed to load department counts'
    });

    this.reports.getTopEmployeesByPoints(10).subscribe({
      next: (rows: TopEmployeeDto[]) => {
        this.topEmpConfig.data.labels = rows.map(r => r.employee);
        this.topEmpConfig.data.datasets[0].data = rows.map(r => r.points);
      },
      error: () => this.error = 'Failed to load top employees'
    });

    this.reports.getRecognitionGivenReceivedByDept().subscribe({
      next: (rows: GivenReceivedDto[]) => {
        this.stackedDeptConfig.data.labels = rows.map(r => r.department);
        this.stackedDeptConfig.data.datasets[0].data = rows.map(r => r.given);
        this.stackedDeptConfig.data.datasets[1].data = rows.map(r => r.received);
      },
      error: () => this.error = 'Failed to load given/received'
    });

    this.reports.getCategoryAverageScores().subscribe({
      next: (rows: CategoryScoreDto[]) => {
        this.radarConfig.data.labels = rows.map(r => r.category);
        this.radarConfig.data.datasets[0].data = rows.map(r => r.score);
      },
      error: () => this.error = 'Failed to load category scores'
    });

    this.reports.getRecentActivities(20).subscribe({
      next: (rows) => { this.activities = rows; this.loading = false; },
      error: () => { this.error = 'Failed to load activities'; this.loading = false; }
    });
  }
}