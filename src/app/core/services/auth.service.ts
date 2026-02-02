import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { TokenService } from './token.service';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user$ = new BehaviorSubject<User | null>(null);
  
  
  private readonly USER_KEY = 'mock_logged_in_user';
  readonly user$ = this._user$.asObservable();
  
  readonly isLoggedIn$ = this.user$.pipe(map(u => !!u));
  
  readonly roles$ = this.user$.pipe(map(u => u?.roles ?? []));

  constructor(private tokenSvc: TokenService) {
    
    const savedUser = localStorage.getItem(this.USER_KEY);
    if (savedUser) {
      this._user$.next(JSON.parse(savedUser));
    } 
    else {
      const token = this.tokenSvc.getToken();
      if (token) this.hydrateUserFromToken(token);
    }
  }

  //get current user value
  getCurrentUserId(): string | null {
    return this._user$.getValue()?.id ?? null;
  }
  
  getCurrentUserId$(): Observable<string | null> {
    return this.user$.pipe(map(u => u?.id ?? null));
  }

  getCurrentUserName$(): Observable<string | null> {
    return this.user$.pipe(map(u => u?.name ?? null));
  }

  
  loginWithToken(token: string): void {
    this.tokenSvc.setToken(token);
    this.hydrateUserFromToken(token);
  }

  
  loginWithUser(user: User): void {
    
    this._user$.next(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  
  logout(): void {
    this.tokenSvc.clearToken();
    localStorage.removeItem(this.USER_KEY); // Clear the saved user
    this._user$.next(null);
  }

  // --- Role Helpers (Unchanged) ---
  hasRole$(role: Role): Observable<boolean> {
    return this.roles$.pipe(map(roles => roles.includes(role)));
  }

  hasAnyRole$(required: Role[]): Observable<boolean> {
    return this.roles$.pipe(map(roles => required.some(r => roles.includes(r))));
  }

  hasAllRoles$(required: Role[]): Observable<boolean> {
    return this.roles$.pipe(map(roles => required.every(r => roles.includes(r))));
  }

  private hydrateUserFromToken(token: string): void {
    const payload = this.tokenSvc.decodePayload<any>(token);
    const user: User | null = payload
      ? {
        id: payload.sub ?? payload.userId ?? 'unknown',
        name: payload.name ?? '',
        email: payload.email ?? '',
        roles: (payload.roles ?? payload['role'] ?? [])
          .map((r: string) => normalizeRole(r))
          .filter(Boolean) as Role[],
      }
      : null;
    this._user$.next(user);
  }
}

function normalizeRole(r: string): Role | null {
  const x = (r || '').trim().toLowerCase();
  if (x === 'admin') return 'Admin';
  if (x === 'manager') return 'Manager';
  if (x === 'employee') return 'Employee';
  return null;
}