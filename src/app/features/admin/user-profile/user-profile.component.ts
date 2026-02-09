
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../user-management/user-management.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent {
  @Input() user!: User;

  @Output() closed = new EventEmitter<void>();
  @Output() edit = new EventEmitter<number>();
  @Output() toggleStatus = new EventEmitter<number>();
  @Output() resetPassword = new EventEmitter<number>();

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
    return total || 1; // avoid division by zero
  }
  get feedbackPct(): number {
    return Math.round(((this.user.feedback ?? 0) / this.totalActivity) * 100);
  }
  get recognitionPct(): number {
    return Math.round(((this.user.recognition ?? 0) / this.totalActivity) * 100);
  }
}

