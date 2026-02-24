
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../service/manager.service';
import { ManagerFeedbackItem, PagedResult } from '../models/manager.models';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-manager-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-feedback.component.html',
  styleUrls: ['./manager-feedback.component.css']
})
export class ManagerFeedbackComponent implements OnInit {
  feedbackList: ManagerFeedbackItem[] = [];
  filteredList: ManagerFeedbackItem[] = [];
  searchText = '';
  isLoading = false;
  errorMessage: string | null = null;
  
  // Modal state
  showModal = false;
  selectedFeedback: ManagerFeedbackItem | null = null;

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    this.loadFeedback();
  }

  loadFeedback(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.managerService.getAllFeedback({ pageSize: 100 })
      .subscribe({
        next: (result: PagedResult<ManagerFeedbackItem>) => {
          this.feedbackList = this.sortFeedbackByStatus(result.items);
          this.filteredList = [...this.feedbackList];
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load feedback';
          this.isLoading = false;
        }
      });
  }

  filterFeedback(): void {
    const q = this.searchText.trim().toLowerCase();
    const filtered = this.feedbackList.filter(f =>
      f.fromUserName.toLowerCase().includes(q) ||
      f.toUserId.toLowerCase().includes(q) ||
      f.categoryName.toLowerCase().includes(q)
    );
    this.filteredList = this.sortFeedbackByStatus(filtered);
  }

  updateStatus(id: number, newStatus: 'Acknowledged' | 'Resolved'): void {
    this.isLoading = true;
    this.managerService.updateFeedbackStatus(id, newStatus)
      .subscribe({
        next: (success) => {
          if (success) this.loadFeedback();
          else this.errorMessage = 'Failed to update status';
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to update status';
          this.isLoading = false;
        }
      });
  }

  private sortFeedbackByStatus(items: ManagerFeedbackItem[]): ManagerFeedbackItem[] {
    return items.sort((a, b) => {
      // Define priority: Pending = 0, Acknowledged = 1, Resolved = 2
      const getPriority = (status: string) => {
        switch (status) {
          case 'Pending': return 0;
          case 'Acknowledged': return 1;
          case 'Resolved': return 2;
          default: return 3;
        }
      };

      const priorityDiff = getPriority(a.status) - getPriority(b.status);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      // Within same status, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }


  downloadSinglePDF(feedback: ManagerFeedbackItem) {
    const doc = new jsPDF();
    doc.text(`Feedback Report - ${feedback.toUserId}`, 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Field', 'Details']],
      body: [
        ['From', feedback.fromUserName],
        ['To', feedback.toUserName],
        ['Category', feedback.categoryName],
        ['Date', feedback.createdAt],
        ['Status', feedback.status],
        ['Comments', feedback.comments]
      ],
    });
    doc.save(`Feedback_${feedback.toUserId}.pdf`);
  }


  downloadFullReport() {
    const doc = new jsPDF();
    doc.text('Team Feedback Summary Report', 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['#', 'From', 'To', 'Category', 'Date', 'Status']],
      body: this.filteredList.map((f, i) => [
        i + 1,
        f.fromUserName,
        f.toUserName,
        f.categoryName,
        f.createdAt,
        f.status
      ]),
    });
    doc.save('Team_Feedback_Report.pdf');
  }

  viewFeedback(id: number): void {
    const item = this.feedbackList.find(f => f.feedbackId === id);
    if (item) {
      this.selectedFeedback = item;
      this.showModal = true;
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedFeedback = null;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Acknowledged': return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  trackById(_: number, item: ManagerFeedbackItem): number {
    return item.feedbackId;
  }
}