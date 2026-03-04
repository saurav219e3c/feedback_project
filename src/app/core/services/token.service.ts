
import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'access_token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  
  setToken(token: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  clearToken(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  // Basic JWT payload decode (no signature verification). Replace with jwt-decode later.
  decodePayload<T = any>(token: string): T | null {
    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(normalized);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}

