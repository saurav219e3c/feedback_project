  import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { EmployeeService, Feedback } from '../service/employee.service';



@Component({
  selector: 'app-employee-feedback',
  imports: [CommonModule],
  templateUrl: './employee-feedback.component.html',
  styleUrl: './employee-feedback.component.css'
})


export class EmployeeFeedbackComponent implements OnInit {


  //feedbackList: Feedback[]=[];
  currentUser: string ='';
  constructor(private empService:EmployeeService){}

  rawFeedback = signal<Feedback[]>([]);

  feedbackView = computed(()=> {
    const raw = this.rawFeedback();
    return raw.map(item =>({
      ...item,//keeps orignal data

      senderName: item.isAnonymous ? 'Anonymous Colleage' : this.empService.getEmployeeName(item.submittedByUserId)
    }));
  });


  
  ngOnInit(): void { 
    this.currentUser=this.empService.getCurrentUser();
    //this.feedbackList = this.empService.getMyReceivedFeedback();
    //load data into signal
    const data = this.empService.getMyReceivedFeedback();  //backend se data lana hai 
    this.rawFeedback.set(data);

  }

  // Helper to get initials for the avatar
  getInitials(name: string): string {
    const safeName = name || 'Unknown';
    return safeName.split(' ').map(n => n[0]).join('').toLocaleUpperCase();
  }
}