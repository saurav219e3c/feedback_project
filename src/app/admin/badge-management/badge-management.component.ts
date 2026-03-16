import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminBadgeService,
  BadgeDto,
  CreateBadgeDto,
  UpdateBadgeDto,
  PagedBadgeResult
} from '../services/admin-badge.service';
import Swal from 'sweetalert2';

interface BadgeForm {
  badgeId: string;
  badgeName: string;
  description: string;
  iconClass: string;
  isActive: boolean;
}

@Component({
  selector: 'app-badge-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './badge-management.component.html',
  styleUrls: ['./badge-management.component.css']
})
export class BadgeManagementComponent implements OnInit {
  badges: BadgeDto[] = [];
  loading = false;
  error: string | null = null;

  // Pagination
  page = 1;
  pageSize = 10;
  totalCount = 0;

  // Filters
  searchTerm = '';
  filterActive: boolean | undefined = undefined;

  // Form state
  formOpen = false;
  editingId: string | null = null;
  formModel: BadgeForm = this.emptyForm();

  // Preview icons for quick selection
  popularIcons = [
    'bi-award', 'bi-trophy', 'bi-star', 'bi-lightning',
    'bi-heart', 'bi-gem', 'bi-fire', 'bi-shield-check',
    'bi-patch-check', 'bi-emoji-smile', 'bi-rocket', 'bi-crown',
    'bi-bullseye', 'bi-hand-thumbs-up', 'bi-people', 'bi-graph-up',
    'bi-lightbulb', 'bi-stars', 'bi-flag', 'bi-bookmark-star'
  ];

  constructor(private badgeService: AdminBadgeService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    const params: any = { page: this.page, pageSize: this.pageSize };
    if (this.searchTerm.trim()) params['search'] = this.searchTerm.trim();
    if (this.filterActive !== undefined) params['isActive'] = this.filterActive;

    this.badgeService.getAll(params).subscribe({
      next: (result: PagedBadgeResult) => {
        this.badges = result.items;
        this.totalCount = result.totalCount;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load badges. Please try again.';
        this.loading = false;
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  onSearch(): void {
    this.page = 1;
    this.load();
  }

  onFilterChange(): void {
    this.page = 1;
    this.load();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.load();
  }

  openAddForm(): void {
    this.editingId = null;
    this.formModel = this.emptyForm();
    this.formOpen = true;
  }

  openEditForm(badge: BadgeDto): void {
    this.editingId = badge.badgeId;
    this.formModel = {
      badgeId: badge.badgeId,
      badgeName: badge.badgeName,
      description: badge.description ?? '',
      iconClass: badge.iconClass ?? '',
      isActive: badge.isActive
    };
    this.formOpen = true;
    setTimeout(() => {
      document.querySelector('.badge-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  closeForm(): void {
    this.formOpen = false;
    this.editingId = null;
    this.formModel = this.emptyForm();
  }

  selectIcon(icon: string): void {
    this.formModel.iconClass = icon;
  }

  save(): void {
    if (!this.formModel.badgeName.trim()) return;

    if (this.editingId === null) {
      // CREATE
      if (!this.formModel.badgeId.trim()) return;
      const dto: CreateBadgeDto = {
        badgeId: this.formModel.badgeId.trim(),
        badgeName: this.formModel.badgeName.trim(),
        description: this.formModel.description.trim() || undefined,
        iconClass: this.formModel.iconClass.trim() || undefined
      };
      this.badgeService.create(dto).subscribe({
        next: () => {
          this.closeForm();
          this.load();
          Swal.fire({ icon: 'success', title: 'Badge Created', timer: 1500, showConfirmButton: false });
        },
        error: (err) => {
          Swal.fire({ icon: 'error', title: 'Error', text: err?.error?.message || 'Failed to create badge.' });
        }
      });
    } else {
      // UPDATE
      const dto: UpdateBadgeDto = {
        badgeName: this.formModel.badgeName.trim(),
        description: this.formModel.description.trim() || undefined,
        iconClass: this.formModel.iconClass.trim() || undefined,
        isActive: this.formModel.isActive
      };
      this.badgeService.update(this.editingId, dto).subscribe({
        next: () => {
          this.closeForm();
          this.load();
          Swal.fire({ icon: 'success', title: 'Badge Updated', timer: 1500, showConfirmButton: false });
        },
        error: (err) => {
          Swal.fire({ icon: 'error', title: 'Error', text: err?.error?.message || 'Failed to update badge.' });
        }
      });
    }
  }

  confirmDelete(badge: BadgeDto): void {
    Swal.fire({
      title: `Delete "${badge.badgeName}"?`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280'
    }).then(result => {
      if (result.isConfirmed) {
        this.badgeService.delete(badge.badgeId).subscribe({
          next: () => {
            this.load();
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false });
          },
          error: (err) => {
            Swal.fire({ icon: 'error', title: 'Error', text: err?.error?.message || 'Failed to delete badge.' });
          }
        });
      }
    });
  }

  toggleStatus(badge: BadgeDto): void {
    const dto: UpdateBadgeDto = {
      badgeName: badge.badgeName,
      description: badge.description ?? undefined,
      iconClass: badge.iconClass ?? undefined,
      isActive: !badge.isActive
    };
    this.badgeService.update(badge.badgeId, dto).subscribe({
      next: () => this.load(),
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to toggle badge status.' })
    });
  }

  private emptyForm(): BadgeForm {
    return { badgeId: '', badgeName: '', description: '', iconClass: 'bi-award', isActive: true };
  }

  /**
   * Returns true if the stored iconClass value is an emoji / plain text
   * (i.e. NOT a Bootstrap icon class name like 'bi-award').
   */
  isEmoji(iconClass: string | null | undefined): boolean {
    const ic = (iconClass || '').trim();
    if (!ic) return false;
    // Bootstrap icon names always start with 'bi-' or 'bi '
    if (ic.startsWith('bi-') || ic.startsWith('bi ')) return false;
    return true;
  }

  /**
   * Normalises a Bootstrap icon class string so it always includes the
   * base 'bi' class required by Bootstrap Icons.
   *  'bi-award'    →  'bi bi-award'
   *  'bi bi-award' →  'bi bi-award'  (no duplicate)
   */
  getIconClass(iconClass: string | null | undefined): string {
    const ic = (iconClass || 'bi-award').trim();
    return ic.startsWith('bi ') ? ic : `bi ${ic}`;
  }

  /** Returns the raw emoji/text value for display in the circle. */
  getEmojiValue(iconClass: string | null | undefined): string {
    return (iconClass || '⭐').trim();
  }
}
