import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-layout',
  imports: [RouterModule,RouterOutlet,CommonModule],
  templateUrl: './employee-layout.component.html',
  styleUrl: './employee-layout.component.css'
})
export class EmployeeLayoutComponent implements OnInit {
  isSidebarOpen = false;
  isProfileOpen = false;

 

  //user data from auth service
  userName:string='User';
  userEmail: string='';
  employeeId:string='';
  currentUser: User | null=null;

  constructor(private authService: AuthService,private router:Router){} // Inject AuthService and Router
  ngOnInit(): void {

    this.authService.user$.subscribe(user =>{
      if(user){
        this.currentUser = user;
        this.userName = user.name || 'User';
        this.userEmail = user.email || '';
        this.employeeId = user.id || '';
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleProfile(event: Event): void {
    event.stopPropagation(); // Prevents document click from closing it immediately
    this.isProfileOpen = !this.isProfileOpen;
  }

  onNavClick(): void {
    // Unconditionally close the sidebar (works on Desktop & Mobile)
    this.isSidebarOpen = false;
  }

  // Closes dropdown when clicking anywhere else
  @HostListener('document:click', ['$event'])
  closeProfile(event: Event) {
    this.isProfileOpen = false;
  }


  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
 

  //logout method
  logout(): void {
    Swal.fire({
      title: 'Logout Confirmation',
      text: 'Do you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        Swal.fire({
          title: 'Logged Out!',
          text: 'Logout successful',
          icon: 'success',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/auth/home-page']);
        });
      }
    });
  }

}
