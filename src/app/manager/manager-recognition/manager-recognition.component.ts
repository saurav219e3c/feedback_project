import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ManagerService } from '../service/manager.service';
import { RecognitionItem } from '../models/manager.models';

@Component({
  selector: 'app-manager-recognition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-recognition.component.html'
})
export class ManagerRecognitionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  recognitions: RecognitionItem[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private managerService: ManagerService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.managerService.getAllRecognitions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          // Sort so the latest recognition is at the top
          this.recognitions = items.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load recognitions';
          this.isLoading = false;
        }
      });
  }

  getBadgeTheme(categoryName: string, points: number) {
    const icons: Record<string, string> = {
      'Leader': 'bi-rocket-takeoff-fill',
      'Team Player': 'bi-people-fill',
      'Problem Solver': 'bi-cpu-fill',
      'Innovator': 'bi-lightbulb-fill',
      'Leadership': 'bi-rocket-takeoff-fill',
      'Teamwork': 'bi-people-fill',
      'Innovation': 'bi-lightbulb-fill',
      'Excellence': 'bi-star-fill'
    };

    let themeColor: string;
    if (points >= 8) themeColor = '#22c55e';      // Green
    else if (points >= 6) themeColor = '#f59e0b'; // Amber
    else themeColor = '#ef4444';                  // Red

    return {
      color: themeColor,
      icon: icons[categoryName] || 'bi-award-fill'
    };
  }

  // Stats helpers
  getTotalPoints(): number {
    return this.recognitions.reduce((sum, r) => sum + r.points, 0);
  }

  getUniqueRecipients(): number {
    return new Set(this.recognitions.map(r => r.toUserId)).size;
  }

  getAvgPoints(): string {
    if (this.recognitions.length === 0) return '0';
    return (this.getTotalPoints() / this.recognitions.length).toFixed(1);
  }

  // Styling helpers based on points
  getGradientClass(points: number): string {
    if (points >= 8) return 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500';
    if (points >= 6) return 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500';
    return 'bg-gradient-to-r from-rose-400 via-pink-500 to-red-500';
  }

  getIconBgClass(points: number): string {
    if (points >= 8) return 'bg-gradient-to-br from-emerald-400 to-green-600';
    if (points >= 6) return 'bg-gradient-to-br from-amber-400 to-orange-600';
    return 'bg-gradient-to-br from-rose-400 to-red-600';
  }

  getCategoryBadgeClass(points: number): string {
    if (points >= 8) return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    if (points >= 6) return 'bg-amber-100 text-amber-700 border border-amber-200';
    return 'bg-rose-100 text-rose-700 border border-rose-200';
  }

  getPointsBgClass(points: number): string {
    if (points >= 8) return 'bg-gradient-to-br from-emerald-500 to-green-600';
    if (points >= 6) return 'bg-gradient-to-br from-amber-500 to-orange-600';
    return 'bg-gradient-to-br from-rose-500 to-red-600';
  }

  getAvatarClass(points: number): string {
    if (points >= 8) return 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white';
    if (points >= 6) return 'bg-gradient-to-br from-amber-500 to-orange-600 text-white';
    return 'bg-gradient-to-br from-rose-500 to-pink-600 text-white';
  }

  getGlowClass(points: number): string {
    if (points >= 8) return 'shadow-[inset_0_0_60px_rgba(16,185,129,0.1)]';
    if (points >= 6) return 'shadow-[inset_0_0_60px_rgba(245,158,11,0.1)]';
    return 'shadow-[inset_0_0_60px_rgba(239,68,68,0.1)]';
  }

  getCategoryIcon(categoryName: string): SafeHtml {
    const icons: Record<string, string> = {
      'Leader': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>',
      'Leadership': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>',
      'Team Player': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>',
      'Teamwork': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>',
      'Problem Solver': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>',
      'Innovator': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>',
      'Innovation': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>',
      'Excellence': '<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>'
    };
    
    const defaultIcon = '<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>';
    return this.sanitizer.bypassSecurityTrustHtml(icons[categoryName] || defaultIcon);
  }
}