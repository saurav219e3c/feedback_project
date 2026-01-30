// src/app/auth/service/login.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  
  private STORAGE_KEY = 'feedback_project_users';

  // src/app/auth/service/login.service.ts

constructor() {
  const data = localStorage.getItem(this.STORAGE_KEY);
  if (!data) {
    const defaultAdmin = [{
      username: 'adm1234',      
      name: 'System Admin',
      password: 'Admin@123', 
      role: 'admin',
      department: 'IT'
    }];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultAdmin));
  }
}

// src/app/auth/service/login.service.ts

login(credentials: any): Observable<any | null> {
  const data = localStorage.getItem(this.STORAGE_KEY);
  const users = data ? JSON.parse(data) : [];

   const foundUser = users.find((u: any) => {
    // Match by userId or username
    const usernameMatch = u.userId === credentials.username || u.username === credentials.username;
    
    // Password must match
    const passwordMatch = u.password === credentials.password;
    
    // If role is provided, it must match. If not provided, accept any role
    const roleMatch = !credentials.role || u.role === credentials.role || u.role?.toLowerCase() === credentials.role?.toLowerCase();
    
    return usernameMatch && passwordMatch && roleMatch;
  });

  return of(foundUser || null);
}

}