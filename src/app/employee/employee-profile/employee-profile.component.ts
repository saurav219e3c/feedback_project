import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

interface ProfileData {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  departmentId: string;
  departmentName: string;
  createdAt: string;
}

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-profile.component.html',
  styleUrl: './employee-profile.component.css'
})
export class EmployeeProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);

  isEditing = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  employee = {
    id: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    departmentId: '',
    joinDate: '',
    role: '',
    location: 'Pune, India'
  };

  // Validation error flags
  emailError = '';
  phoneError = '';
  nameError = '';

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.get<ProfileData>('/api/users/profile').subscribe({
      next: (profile) => {
        const savedLocation = localStorage.getItem(`user_location_${profile.userId}`);

        this.employee = {
          id: profile.userId,
          name: profile.fullName,
          email: profile.email,
          phone: profile.phone || '',
          department: profile.departmentName,
          departmentId: profile.departmentId,
          joinDate: profile.createdAt.split('T')[0],
          role: profile.role,
          location: savedLocation || 'Pune, India'
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.isLoading = false;

        this.authService.user$.subscribe(user => {
          if (user) {
            this.employee.id = user.id;
            this.employee.name = user.name;
            this.employee.email = user.email;
          }
        });
      }
    });
  }

  validatePhone(event: any) {
    const value = event.target.value;
    this.employee.phone = value.replace(/[^0-9]/g, '').slice(0, 10);
    this.phoneError = '';
  }

  validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.employee.email) {
      this.emailError = 'Email is required';
    } else if (!emailRegex.test(this.employee.email)) {
      this.emailError = 'Please enter a valid email address';
    } else {
      this.emailError = '';
    }
  }

  validateName() {
    if (!this.employee.name || this.employee.name.trim().length < 2) {
      this.nameError = 'Name must be at least 2 characters';
    } else {
      this.nameError = '';
    }
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
    this.successMessage = '';
    this.emailError = '';
    this.phoneError = '';
    this.nameError = '';
  }

  saveChanges() {
    this.phoneError = '';

    if (this.employee.phone && this.employee.phone.length !== 10) {
      this.phoneError = 'Phone number must be exactly 10 digits';
      this.errorMessage = 'Please fix the validation errors';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updatePayload = {
      fullName: this.employee.name,
      email: this.employee.email,
      phone: this.employee.phone || null
    };

    this.apiService.put('/api/users/profile', updatePayload).subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditing = false;
        this.successMessage = 'Phone number updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to update profile. Please try again.';
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
