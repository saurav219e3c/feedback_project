import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-employee-layout',
  imports: [RouterModule,RouterOutlet,CommonModule],
  templateUrl: './employee-layout.component.html',
  styleUrl: './employee-layout.component.css'
})
export class EmployeeLayoutComponent implements OnInit {
  isSidebarOpen = false;
  isProfileOpen = false;

 

  
  userName:string='User';
  userEmail: string='';
  employeeId:string='';
  currentUser: User | null=null;

  constructor(private authService: AuthService,private router:Router){} 
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
    event.stopPropagation(); 
    this.isProfileOpen = !this.isProfileOpen;
  }

  onNavClick(): void {
    
    this.isSidebarOpen = false;
  }

  
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
    this.authService.logout();
    this.router.navigate(['/auth/home-page']);
  
  }

}
