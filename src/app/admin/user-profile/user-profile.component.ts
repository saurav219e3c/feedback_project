
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../user-management/user-management.component';
import {
  AdminUserProfileService,
  FeedbackItemDto,
  RecognitionItemDto,
  PagedResult
} from '../services/admin-user-profile.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent {
  @Input() user!: User;

  @Output() closed = new EventEmitter<void>();
  @Output() edit = new EventEmitter<string>();
  @Output() toggleStatus = new EventEmitter<string>();
  @Output() resetPassword = new EventEmitter<string>();

  private profileService = inject(AdminUserProfileService);

  // ── Log overlay state ──
  logOpen = false;                       // is the overlay visible?
  logType: 'feedback' | 'recognition' = 'feedback'; // which section was clicked
  logTab: 'given' | 'received' = 'given';           // sub-tab

  feedbackGiven: FeedbackItemDto[] = [];
  feedbackReceived: FeedbackItemDto[] = [];
  recognitionGiven: RecognitionItemDto[] = [];
  recognitionReceived: RecognitionItemDto[] = [];

  // Pagination
  pageSize = 5;
  fbGivenPage = 1;   fbGivenTotal = 0;
  fbRecvPage = 1;    fbRecvTotal = 0;
  recGivenPage = 1;  recGivenTotal = 0;
  recRecvPage = 1;   recRecvTotal = 0;

  logLoading = false;

  onBackdropClick() {
    this.closed.emit();
  }

  stopPropagation(e: Event) {
    e.stopPropagation();
  }

  onEdit() { this.edit.emit(this.user.id); }
  onToggleStatus() { this.toggleStatus.emit(this.user.id); }
  onResetPassword() { this.resetPassword.emit(this.user.id); }

  // Helpers for chart (pure CSS widths)
  get totalActivity(): number {
    const total = (this.user.feedback ?? 0) + (this.user.recognition ?? 0);
    return total || 1;
  }
  get feedbackPct(): number {
    return Math.round(((this.user.feedback ?? 0) / this.totalActivity) * 100);
  }
  get recognitionPct(): number {
    return Math.round(((this.user.recognition ?? 0) / this.totalActivity) * 100);
  }

  // ── Open log overlay ──
  openLog(type: 'feedback' | 'recognition') {
    this.logType = type;
    this.logTab = 'given';
    this.logOpen = true;
    this.resetPages();
    this.loadCurrentTab();
  }

  switchLogType(type: 'feedback' | 'recognition') {
    this.logType = type;
    this.logTab = 'given';
    this.resetPages();
    this.loadCurrentTab();
  }

  switchTab(tab: 'given' | 'received') {
    this.logTab = tab;
    this.loadCurrentTab();
  }

  closeLog() {
    this.logOpen = false;
  }

  // ── Pagination helpers ──
  get currentPage(): number {
    if (this.logType === 'feedback') return this.logTab === 'given' ? this.fbGivenPage : this.fbRecvPage;
    return this.logTab === 'given' ? this.recGivenPage : this.recRecvPage;
  }

  get totalPages(): number {
    let total = 0;
    if (this.logType === 'feedback') total = this.logTab === 'given' ? this.fbGivenTotal : this.fbRecvTotal;
    else total = this.logTab === 'given' ? this.recGivenTotal : this.recRecvTotal;
    return Math.ceil(total / this.pageSize) || 1;
  }

  get totalRecords(): number {
    if (this.logType === 'feedback') return this.logTab === 'given' ? this.fbGivenTotal : this.fbRecvTotal;
    return this.logTab === 'given' ? this.recGivenTotal : this.recRecvTotal;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    if (this.logType === 'feedback') {
      if (this.logTab === 'given') this.fbGivenPage = page;
      else this.fbRecvPage = page;
    } else {
      if (this.logTab === 'given') this.recGivenPage = page;
      else this.recRecvPage = page;
    }
    this.loadCurrentTab();
  }

  private resetPages() {
    this.fbGivenPage = 1; this.fbRecvPage = 1;
    this.recGivenPage = 1; this.recRecvPage = 1;
  }

  // ── Data loading ──
  private loadCurrentTab() {
    this.logLoading = true;
    const userId = this.user.id;

    if (this.logType === 'feedback' && this.logTab === 'given') {
      this.profileService.getFeedbackGiven(userId, this.fbGivenPage, this.pageSize).subscribe({
        next: r => this.handleFeedback(r, 'given'),
        error: () => this.logLoading = false
      });
    } else if (this.logType === 'feedback' && this.logTab === 'received') {
      this.profileService.getFeedbackReceived(userId, this.fbRecvPage, this.pageSize).subscribe({
        next: r => this.handleFeedback(r, 'received'),
        error: () => this.logLoading = false
      });
    } else if (this.logType === 'recognition' && this.logTab === 'given') {
      this.profileService.getRecognitionsGiven(userId, this.recGivenPage, this.pageSize).subscribe({
        next: r => this.handleRecognition(r, 'given'),
        error: () => this.logLoading = false
      });
    } else {
      this.profileService.getRecognitionsReceived(userId, this.recRecvPage, this.pageSize).subscribe({
        next: r => this.handleRecognition(r, 'received'),
        error: () => this.logLoading = false
      });
    }
  }

  private handleFeedback(result: PagedResult<FeedbackItemDto>, dir: 'given' | 'received') {
    if (dir === 'given') {
      this.feedbackGiven = result.items;
      this.fbGivenTotal = result.totalCount;
    } else {
      this.feedbackReceived = result.items;
      this.fbRecvTotal = result.totalCount;
    }
    this.logLoading = false;
  }

  private handleRecognition(result: PagedResult<RecognitionItemDto>, dir: 'given' | 'received') {
    if (dir === 'given') {
      this.recognitionGiven = result.items;
      this.recGivenTotal = result.totalCount;
    } else {
      this.recognitionReceived = result.items;
      this.recRecvTotal = result.totalCount;
    }
    this.logLoading = false;
  }

  // ── Current items for template ──
  get currentFeedbackItems(): FeedbackItemDto[] {
    return this.logTab === 'given' ? this.feedbackGiven : this.feedbackReceived;
  }

  get currentRecognitionItems(): RecognitionItemDto[] {
    return this.logTab === 'given' ? this.recognitionGiven : this.recognitionReceived;
  }
}

