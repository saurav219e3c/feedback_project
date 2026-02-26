import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface BadgeDto {
  badgeId: string;
  badgeName: string;
  description: string | null;
  iconClass: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface PagedBadgeResult {
  page: number;
  pageSize: number;
  totalCount: number;
  items: BadgeDto[];
}

export interface CreateBadgeDto {
  badgeId: string;
  badgeName: string;
  description?: string;
  iconClass?: string;
}

export interface UpdateBadgeDto {
  badgeName: string;
  description?: string;
  iconClass?: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminBadgeService {
  constructor(private api: ApiService) {}

  getAll(params?: { isActive?: boolean; search?: string; page?: number; pageSize?: number }): Observable<PagedBadgeResult> {
    return this.api.get<PagedBadgeResult>('/api/badges', params as any);
  }

  getById(id: string): Observable<BadgeDto> {
    return this.api.get<BadgeDto>(`/api/badges/${id}`);
  }

  create(dto: CreateBadgeDto): Observable<BadgeDto> {
    return this.api.post<BadgeDto>('/api/badges', dto);
  }

  update(id: string, dto: UpdateBadgeDto): Observable<BadgeDto> {
    return this.api.put<BadgeDto>(`/api/badges/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/api/badges/${id}`);
  }
}
