// src/app/auth/service/register.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface PublicRegisterDto {
  userId: string;
  fullName: string;
  email: string;
  department: string; // change to departmentId: number if backend expects numeric FK
  password: string;
}

@Injectable({ providedIn: 'root' })
export class RegisterService {
  constructor(private api: ApiService) {}

  registerPublic(dto: PublicRegisterDto): Observable<any> {
    return this.api.post('/api/auth/register-public', dto);
  }
}