// src/app/auth/service/register.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface PublicRegisterDto {
  userId: string;
  fullName: string;
  email: string;
  departmentId: string;
  password: string;
}

export interface ManagerRegisterDto {
  userId: string;
  fullName: string;
  email: string;
  departmentId: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class RegisterService {
  constructor(private api: ApiService) {}

  registerPublic(dto: PublicRegisterDto): Observable<any> {
    return this.api.post('/api/auth/register-public', dto);
  }

  registerManager(dto: ManagerRegisterDto): Observable<any> {
    return this.api.post('/api/auth/register-manager', dto);
  }
}