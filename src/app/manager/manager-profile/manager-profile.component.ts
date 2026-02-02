import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-manager-profile',
  standalone: true,
  imports: [ CommonModule, FormsModule],
  templateUrl: './manager-profile.component.html',
  styleUrl: './manager-profile.component.css'
})
export class ManagerProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isEditing = false;
  errorMessage = '';
  
  manager: any = {
    id: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    location: 'Pune, India',
    joinDate: ''
  };

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.manager.id = user.id;
        
        // Load persisted data from localStorage first
        const savedMeta = localStorage.getItem(`user_meta_${user.id}`);
        if (savedMeta) {
          const meta = JSON.parse(savedMeta);
          this.manager.name = meta.name || user.name;
          this.manager.email = meta.email || user.email;
          this.manager.phone = meta.phone || '';
          this.manager.location = meta.location || 'Pune, India';
        } else {
          this.manager.name = user.name;
          this.manager.email = user.email;
        }
        
        // Department logic based on roles array
        const roles = user.roles || [];
        this.manager.department = roles.includes('Admin') ? 'Administration' : 'IT Operations';

        // Get or Generate persistent random join date
        this.manager.joinDate = this.getPersistentJoinDate(user.id);
      }
    });
  }

  // Prevents typing more than 10 digits and non-numeric characters
  validatePhone(event: any) {
    const value = event.target.value;
    // Keep only numbers and limit to 10
    this.manager.phone = value.replace(/[^0-9]/g, '').slice(0, 10);
  }

  private getPersistentJoinDate(userId: string): string {
    const key = `join_date_${userId}`;
    let date = localStorage.getItem(key);
    if (!date) {
      const year = Math.floor(Math.random() * (2024 - 2020 + 1)) + 2020;
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      date = `${year}-${month}-${day}`;
      localStorage.setItem(key, date);
    }
    return date;
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
  }

  saveChanges() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. Validation Checks
    if (!this.manager.name || this.manager.name.trim().length < 2) {
      this.errorMessage = 'Please enter a valid name.';
      return;
    }

    if (!emailRegex.test(this.manager.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (this.manager.phone && this.manager.phone.length !== 10) {
      this.errorMessage = 'Phone number must be exactly 10 digits.';
      return;
    }

    // 2. Persist to LocalStorage
    const metaData = {
      name: this.manager.name,
      email: this.manager.email,
      phone: this.manager.phone,
      location: this.manager.location
    };
    localStorage.setItem(`user_meta_${this.manager.id}`, JSON.stringify(metaData));

    // 3. Update Global Auth State (Updates Topbar name)
    this.authService.loginWithUser({
      ...this.manager,
      roles: this.manager.department === 'Administration' ? ['Admin'] : ['Manager']
    });

    this.errorMessage = '';
    this.isEditing = false;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}