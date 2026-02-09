
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import the popup component
import { UserProfileComponent } from '../user-profile/user-profile.component';

export interface User {
  id: number;
  name: string;
  role: string;
  feedback: number;
  recognition: number;

  // Extra fields for the profile (kept optional-friendly)
  status?: 'Active' | 'Disabled';
  email?: string;
  phone?: string;
  department?: string;
  joiningDate?: string; // ISO or display string
  manager?: string;
  location?: string;
}

@Component({
  standalone: true,
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule, UserProfileComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent {
  users: User[] = [
    { id: 101, name: 'Gaurav Singh', role: 'Admin',    feedback: 12, recognition: 5,
      status: 'Active', email: 'gaurav.singh@acme.com', phone: '+91-90000-101',
      department: 'Engineering', joiningDate: '2023-05-12', manager: 'Priya Patel', location: 'Pune' },
    { id: 102, name: 'Amit Kumar',   role: 'Employee', feedback: 8,  recognition: 3,
      status: 'Disabled', email: 'amit.kumar@acme.com', phone: '+91-90000-102',
      department: 'Operations', joiningDate: '2024-01-10', manager: 'Rohan Gupta', location: 'Pune' },
    { id: 103, name: 'Ravi Sharma',  role: 'Manager',  feedback: 15, recognition: 7,
      status: 'Active', email: 'ravi.sharma@acme.com', phone: '+91-90000-103',
      department: 'Quality', joiningDate: '2022-09-22', manager: 'Neha Joshi', location: 'Pune' },
    { id: 104, name: 'Neha Verma',   role: 'Employee', feedback: 6,  recognition: 2,
      status: 'Active', email: 'neha.verma@acme.com', phone: '+91-90000-104',
      department: 'Finance', joiningDate: '2024-03-02', manager: 'Rohan Gupta', location: 'Pune' },
    { id: 105, name: 'Karan Patel',  role: 'Employee', feedback: 9,  recognition: 4,
      status: 'Disabled', email: 'karan.patel@acme.com', phone: '+91-90000-105',
      department: 'Engineering', joiningDate: '2023-11-18', manager: 'Priya Patel', location: 'Pune' },
    { id: 106, name: 'sam Patel',    role: 'Employee', feedback: 9,  recognition: 4,
      status: 'Active', email: 'sam.patel@acme.com', phone: '+91-90000-106',
      department: 'Support', joiningDate: '2023-08-01', manager: 'Neha Joshi', location: 'Pune' },
    { id: 107, name: 'ram Patel',    role: 'Employee', feedback: 9,  recognition: 4,
      status: 'Active', email: 'ram.patel@acme.com', phone: '+91-90000-107',
      department: 'Engineering', joiningDate: '2024-04-20', manager: 'Priya Patel', location: 'Pune' },
    { id: 108, name: 'tam Patel',    role: 'Employee', feedback: 9,  recognition: 4,
      status: 'Disabled', email: 'tam.patel@acme.com', phone: '+91-90000-108',
      department: 'Support', joiningDate: '2023-12-05', manager: 'Neha Joshi', location: 'Pune' },
    { id: 109, name: 'tam Patel',    role: 'Employee', feedback: 9,  recognition: 4,
      status: 'Active', email: 'tam2.patel@acme.com', phone: '+91-90000-109',
      department: 'Finance', joiningDate: '2022-11-30', manager: 'Rohan Gupta', location: 'Pune' },
    { id: 110, name: 'gm Patel',     role: 'Employee', feedback: 9,  recognition: 4,
      status: 'Active', email: 'gm.patel@acme.com', phone: '+91-90000-110',
      department: 'Engineering', joiningDate: '2023-07-17', manager: 'Priya Patel', location: 'Pune' },
    { id: 111, name: 'city Patel',   role: 'Employee', feedback: 9,  recognition: 4,
      status: 'Disabled', email: 'city.patel@acme.com', phone: '+91-90000-111',
      department: 'Support', joiningDate: '2024-02-01', manager: 'Neha Joshi', location: 'Pune' },
    { id: 112, name: 'somu Patel',   role: 'Employee', feedback: 9,  recognition: 4,
      status: 'Active', email: 'somu.patel@acme.com', phone: '+91-90000-112',
      department: 'Quality', joiningDate: '2023-06-10', manager: 'Neha Joshi', location: 'Pune' },
  ];

  searchTerm = '';

  // Popup state
  selectedUser: User | null = null;

  get filteredUsers() {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.users;

    return this.users.filter(u => {
      const name = (u.name ?? '').toLowerCase();
      const role = (u.role ?? '').toLowerCase();
      const idStr = String(u.id ?? '').toLowerCase();
      return name.includes(q) || role.includes(q) || idStr.includes(q);
    });
  }

  onSearchChange(): void {
    // No-op (kept for your API compatibility)
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  // Open profile from card click
  openProfile(user: User) {
    this.selectedUser = user;
  }

  // Close popup
  closeProfile() {
    this.selectedUser = null;
  }

  // Actions from profile
  editUser(userId: number) {
    console.log('Edit user', userId);
    // Hook: open an edit modal or inline form if desired.
  }

  toggleUserStatus(userId: number) {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      const current = this.users[idx];
      const next: User = { ...current, status: current.status === 'Active' ? 'Disabled' : 'Active' };
      this.users[idx] = next;
      if (this.selectedUser && this.selectedUser.id === userId) {
        this.selectedUser = next; // keep popup in sync
      }
    }
  }

  resetPassword(userId: number) {
    alert(`Password reset initiated for user ID ${userId}.`);
  }
}

