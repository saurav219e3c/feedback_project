import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

// ── DTOs matching backend InsightsDtos.cs ──

export interface PagedResult<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}

export interface FeedbackItemDto {
  feedbackId: number;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  categoryId: string;
  categoryName: string;
  comments: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface RecognitionItemDto {
  recognitionId: number;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  badgeId: string;
  badgeName: string;
  points: number;
  message: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUserProfileService {
  constructor(private api: ApiService) {}

  getFeedbackGiven(userId: string, page = 1, pageSize = 5): Observable<PagedResult<FeedbackItemDto>> {
    return this.api.get<PagedResult<FeedbackItemDto>>(
      `/api/insight/users/${userId}/feedback/given`,
      { page, pageSize }
    );
  }

  getFeedbackReceived(userId: string, page = 1, pageSize = 5): Observable<PagedResult<FeedbackItemDto>> {
    return this.api.get<PagedResult<FeedbackItemDto>>(
      `/api/insight/users/${userId}/feedback/received`,
      { page, pageSize }
    );
  }

  getRecognitionsGiven(userId: string, page = 1, pageSize = 5): Observable<PagedResult<RecognitionItemDto>> {
    return this.api.get<PagedResult<RecognitionItemDto>>(
      `/api/insight/users/${userId}/recognitions/given`,
      { page, pageSize }
    );
  }

  getRecognitionsReceived(userId: string, page = 1, pageSize = 5): Observable<PagedResult<RecognitionItemDto>> {
    return this.api.get<PagedResult<RecognitionItemDto>>(
      `/api/insight/users/${userId}/recognitions/received`,
      { page, pageSize }
    );
  }
}
