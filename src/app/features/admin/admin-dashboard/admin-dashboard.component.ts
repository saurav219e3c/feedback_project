import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import Chart from 'chart.js/auto';
import {
  AdminDashboardService,
  DashboardSummary,
  CategoryCount,
  TypeDistribution,
  MonthlyTrend,
  ActivityItem,
} from '../services/admin-dashboard.service';
import { Subscription, combineLatest } from 'rxjs'; // ⬅️ add combineLatest

type DatasetKind = 'feedback' | 'recognition';
type BarView = 'category' | 'monthly-line' | 'monthly-bar';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  // Summary cards + Activity
  summary?: DashboardSummary;
  activities: ActivityItem[] = [];

  // Chart canvases + instances
  @ViewChild('barArea') barArea!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieArea') pieArea!: ElementRef<HTMLCanvasElement>;
  private barChart?: Chart;
  private pieChart?: Chart;

  // State: dataset & view
  currentDataset: DatasetKind = 'feedback'; // controls theme + colors
  currentBarView: BarView = 'category';

  // Data stores via observables
  feedbackByCategory: CategoryCount[] = [];
  recognitionByCategory: CategoryCount[] = [];
  feedbackTypeDist: TypeDistribution[] = [];
  recognitionTypeDist: TypeDistribution[] = [];
  monthlyFeedback: MonthlyTrend[] = [];
  monthlyRecognition: MonthlyTrend[] = [];

  // Auto-slide control
  private autoSlideTimer?: number; // DOM setInterval id
  private autoSlidePaused = false;

  // Subscriptions holder
  private subs = new Subscription();

  // Palette (stronger on white)
  private palette = {
    bluePrimary: '#1F6BFF',
    blueLight: '#4C8EFF',
    saffron: '#FF7A00',
    saffronLight: '#FFB000',
    blueSoft3: '#86C5FF',
    saffronSoft3: '#FFD366',
    textStrong: '#1a1a1a',
  };

  constructor(private dashboardSvc: AdminDashboardService) {}

  // Lifecycle
  ngOnInit(): void {
    // Summary & activity remain as-is
    this.subs.add(
      this.dashboardSvc
        .getSummary$()
        .subscribe((summary) => (this.summary = summary))
    );
    this.subs.add(
      this.dashboardSvc
        .getActivityLog$()
        .subscribe((items) => (this.activities = items))
    );

    // Group all BAR-related data in one stream, refresh once
    this.subs.add(
      combineLatest([
        this.dashboardSvc.getFeedbackByCategory$(),
        this.dashboardSvc.getRecognitionByCategory$(),
        this.dashboardSvc.getMonthlyFeedbackTrend$(),
        this.dashboardSvc.getMonthlyRecognitionTrend$(),
      ]).subscribe(
        ([feedbackByCat, recognitionByCat, monthlyFb, monthlyRec]) => {
          this.feedbackByCategory = feedbackByCat;
          this.recognitionByCategory = recognitionByCat;
          this.monthlyFeedback = monthlyFb;
          this.monthlyRecognition = monthlyRec;
          this.refreshBarIfNeeded(); 
        }
      )
    );

    
    this.subs.add(
      combineLatest([
        this.dashboardSvc.getFeedbackTypeDistribution$(),
        this.dashboardSvc.getRecognitionTypeDistribution$(),
      ]).subscribe(([feedbackPie, recognitionPie]) => {
        this.feedbackTypeDist = feedbackPie;
        this.recognitionTypeDist = recognitionPie;
        this.refreshPieIfNeeded(); 
      })
    );
  }

  ngAfterViewInit(): void {
    this.renderCategoryBar();
    this.renderFeedbackTypePie();
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.clearAutoSlide();
    this.barChart?.destroy();
    this.pieChart?.destroy();
    this.subs.unsubscribe();
  }

  // Dataset & View Toggles
  setDataset(kind: DatasetKind): void {
    if (this.currentDataset === kind) return;
    this.currentDataset = kind;
    switch (this.currentBarView) {
      case 'category':
        this.renderCategoryBar();
        break;
      case 'monthly-line':
        this.renderMonthlyTrend('line');
        break;
      case 'monthly-bar':
        this.renderMonthlyTrend('bar');
        break;
    }
    this.renderFeedbackTypePie();
  }
  showCategoryBar(): void {
    this.currentBarView = 'category';
    this.renderCategoryBar();
  }
  showMonthlyTrend(type: 'line' | 'bar'): void {
    this.currentBarView = type === 'line' ? 'monthly-line' : 'monthly-bar';
    this.renderMonthlyTrend(type);
  }


  private destroyChart(c?: Chart) {
    if (c) c.destroy();
  }

  private getCategoryData() {
    const rows =
      this.currentDataset === 'feedback'
        ? this.feedbackByCategory
        : this.recognitionByCategory;
    const labels = rows.map((r) => r.category);
    const counts = rows.map((r) => r.count);
    const label =
      this.currentDataset === 'feedback'
        ? 'Feedback Count by Category'
        : 'Recognitions by Category';
    const color =
      this.currentDataset === 'feedback'
        ? { bg: this.palette.bluePrimary, border: this.palette.blueLight }
        : { bg: this.palette.saffron, border: this.palette.saffronLight };
    return { labels, counts, label, color };
  }

  private getMonthlyData() {
    const rows =
      this.currentDataset === 'feedback'
        ? this.monthlyFeedback
        : this.monthlyRecognition;
    const labels = rows.map((r) => r.month);
    const counts = rows.map((r) => r.count);
    const label =
      this.currentDataset === 'feedback'
        ? 'Monthly Feedback Trend'
        : 'Monthly Recognitions Trend';
    const color =
      this.currentDataset === 'feedback'
        ? { bg: this.palette.bluePrimary, border: this.palette.blueLight }
        : { bg: this.palette.saffron, border: this.palette.saffronLight };
    return { labels, counts, label, color };
  }

  private getTypeDistData() {
    const rows =
      this.currentDataset === 'feedback'
        ? this.feedbackTypeDist
        : this.recognitionTypeDist;
    const labels = rows.map((r) => r.type);
    const counts = rows.map((r) => r.count);
    const colors =
      this.currentDataset === 'feedback'
        ? [
            this.palette.bluePrimary,
            this.palette.blueLight,
            this.palette.blueSoft3,
          ]
        : [
            this.palette.saffron,
            this.palette.saffronLight,
            this.palette.saffronSoft3,
          ];
    const label =
      this.currentDataset === 'feedback'
        ? 'Feedback Type Distribution'
        : 'Recognition Type Distribution';
    return { labels, counts, label, colors };
  }

  // Category bar (bold on white)
  private renderCategoryBar(): void {
    if (!this.barArea) return;
    const { labels, counts, label, color } = this.getCategoryData();
    this.destroyChart(this.barChart);

    this.barChart = new Chart(this.barArea.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label,
            data: counts,
            backgroundColor: labels.map(() => color.bg),
            borderColor: labels.map(() => color.border),
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: this.palette.textStrong,
              font: { size: 13, weight: 'bold' },
            },
          },
          tooltip: { enabled: true },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: this.palette.textStrong,
              font: { size: 12, weight: 'bold' },
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.15)', lineWidth: 1.5 },
            ticks: {
              color: this.palette.textStrong,
              font: { size: 12, weight: 'bold' },
            },
          },
        },
      },
    });
  }

  // Pie (type distribution) bold on white
  renderFeedbackTypePie(): void {
    if (!this.pieArea) return;
    const { labels, counts, label, colors } = this.getTypeDistData();
    this.destroyChart(this.pieChart);

    this.pieChart = new Chart(this.pieArea.nativeElement, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            label,
            data: counts,
            backgroundColor: colors,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: this.palette.textStrong,
              font: { size: 13, weight: 'bold' },
            },
          },
          tooltip: { enabled: true },
        },
      },
    });
  }

  // Monthly trend (line/bar) bold on white
  private renderMonthlyTrend(type: 'line' | 'bar'): void {
    if (!this.barArea) return;
    const { labels, counts, label, color } = this.getMonthlyData();
    this.destroyChart(this.barChart);

    this.barChart = new Chart(this.barArea.nativeElement, {
      type,
      data: {
        labels,
        datasets: [
          {
            label,
            data: counts,
            backgroundColor:
              type === 'bar' ? labels.map(() => color.bg) : undefined,
            borderColor: color.border,
            borderWidth: 3,
            tension: 0.35,
            pointRadius: type === 'line' ? 4 : 0,
            pointHoverRadius: type === 'line' ? 6 : 0,
            fill: type === 'line' ? false : undefined,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: this.palette.textStrong,
              font: { size: 13, weight: 'bold' },
            },
          },
          tooltip: { enabled: true },
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.12)', lineWidth: 1.5 },
            ticks: {
              color: this.palette.textStrong,
              font: { size: 12, weight: 'bold' },
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.15)', lineWidth: 1.5 },
            ticks: {
              color: this.palette.textStrong,
              font: { size: 12, weight: 'bold' },
            },
          },
        },
      },
    });
  }

  // Auto-rotation with hover pause
  private startAutoSlide(): void {
    this.clearAutoSlide();
    const views: BarView[] = ['category', 'monthly-line', 'monthly-bar'];
    let idx = views.indexOf(this.currentBarView);

    this.autoSlideTimer = window.setInterval(() => {
      if (this.autoSlidePaused) return;
      idx = (idx + 1) % views.length;
      const next = views[idx];
      this.currentBarView = next;

      if (next === 'category') this.renderCategoryBar();
      else if (next === 'monthly-line') this.renderMonthlyTrend('line');
      else this.renderMonthlyTrend('bar');
    }, 5000);
  }
  private clearAutoSlide(): void {
    if (this.autoSlideTimer !== undefined) {
      window.clearInterval(this.autoSlideTimer);
      this.autoSlideTimer = undefined;
    }
  }
  pauseAutoSlide(): void {
    this.autoSlidePaused = true;
  }
  resumeAutoSlide(): void {
    this.autoSlidePaused = false;
  }

  // Refresh when data arrives
  private refreshBarIfNeeded(): void {
    switch (this.currentBarView) {
      case 'category':
        this.renderCategoryBar();
        break;
      case 'monthly-line':
        this.renderMonthlyTrend('line');
        break;
      case 'monthly-bar':
        this.renderMonthlyTrend('bar');
        break;
    }
  }
  private refreshPieIfNeeded(): void {
    this.renderFeedbackTypePie();
  }
}
