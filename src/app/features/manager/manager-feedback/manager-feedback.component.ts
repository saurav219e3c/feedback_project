import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { EmployeeService, Feedback as ServiceFeedback } from '../../employee/service/employee.service';
import { ManagerService } from '../service/manager_service'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Feedback {
  id: number;
  employeeId: string;
  employeeName: string;
  category: string;
  date: string;
  status: 'Pending' | 'Acknowledged' | 'Resolved';
  details: string;
}

@Component({
  selector: 'app-manager-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-feedback.component.html',
  styleUrls: ['./manager-feedback.component.css']
})
export class ManagerFeedbackComponent implements OnInit {
  feedbackList: Feedback[] = [];
  filteredList: Feedback[] = [];
  searchText = '';

  constructor(
    // private employeeService: EmployeeService,
    private managerService: ManagerService
  ) {}

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    const rawData = this.managerService.getAllFeedback();
    
    this.feedbackList = rawData.map((f, index) => ({
      id: f.id || f.feedbackId || index, 
      employeeId: f.targetUserId || 'N/A', 
      employeeName: f.isAnonymous ? 'Anonymous' : (f.searchEmployee || 'Unknown'),
      category: f.category,
      date: f.submissionDate,
      status: f.status || 'Pending',
      details: f.comments
    }));

    this.filteredList = [...this.feedbackList];
  }

  filterFeedback(): void {
    const q = this.searchText.trim().toLowerCase();
    this.filteredList = this.feedbackList.filter(f =>
      f.employeeName.toLowerCase().includes(q) || 
      f.employeeId.toLowerCase().includes(q) || 
      f.category.toLowerCase().includes(q)
    );
  }

  updateStatus(id: number, newStatus: 'Acknowledged' | 'Resolved'): void {
    this.managerService.updateFeedbackStatus(id, newStatus);
    this.refreshData();
  }

  downloadSinglePDF(feedback: Feedback) {
    const doc = new jsPDF();
    doc.text(`Feedback Report - ${feedback.employeeId}`, 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Field', 'Details']],
      body: [
        ['Employee ID', feedback.employeeId],
        ['Employee Name', feedback.employeeName],
        ['Category', feedback.category],
        ['Date', feedback.date],
        ['Status', feedback.status],
        ['Details', feedback.details]
      ],
    });
    doc.save(`Feedback_${feedback.employeeId}.pdf`);
  }

  downloadFullReport() {
    const doc = new jsPDF();
    doc.text('Team Feedback Summary Report', 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['#', 'ID', 'Employee', 'Category', 'Date', 'Status']],
      body: this.filteredList.map((f, i) => [i + 1, f.employeeId, f.employeeName, f.category, f.date, f.status]),
    });
    doc.save('Team_Feedback_Report.pdf');
  }

  viewFeedback(id: number): void {
    const item = this.feedbackList.find(f => f.id === id);
    if (item) {
      alert(`Feedback Details:\n${item.details}`);
    }
  } 

  trackById(_: number, item: Feedback): number {
    return item.id;
  }
}