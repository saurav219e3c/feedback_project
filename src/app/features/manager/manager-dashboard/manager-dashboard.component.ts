import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ManagerService } from '../service/manager_service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './manager-dashboard.component.html'
})
export class ManagerDashboardComponent implements OnInit, OnDestroy {
  data = {
    totalFeedback: 0,
    pendingReviews: 0,
    engagementScore: 0,
    acknowledged: 0,
    growthPercent: 2.4
  };

  display = {
    totalFeedback: 0,
    pendingReviews: 0,
    engagementScore: 0,
    acknowledged: 0
  };

  searchQuery: string = '';
  statusFilter: string = 'All'; // New filter state
  private timer: any;
  private timeUpdateTimer: any; // Timer for dynamic time updates
  activities: any[] = [];
  categoryData: { name: string, count: number, percent: number, colorClass: string }[] = []; //this is used for category distribution chart

  constructor(private managerService: ManagerService) {}

  ngOnInit() {
    this.loadRealData();
    this.loadCategoryDistribution();
    this.animate();

    // Update activity times every 60 seconds
    this.timeUpdateTimer = setInterval(() => {
      this.refreshActivityTimes();
    }, 60000);
  } //this is used to load real data from the service 

  loadRealData() {
    const allFeedback = this.managerService.getAllFeedback();

    this.data.totalFeedback = allFeedback.length;
    this.data.pendingReviews = allFeedback.filter(f => !f.status || f.status === 'Pending').length;
    this.data.acknowledged = allFeedback.filter(f => f.status === 'Acknowledged' || f.status === 'Resolved').length; 

    if (this.data.totalFeedback > 0) {
      this.data.engagementScore = Math.round((this.data.acknowledged / this.data.totalFeedback) * 100);
    } // Calculate engagement score

    this.activities = allFeedback.slice(-5).reverse().map(f => ({
      ...f,
      title: f.status === 'Resolved' ? 'Review Completed' : 'New Feedback',
      user: f.isAnonymous ? 'Anonymous' : (f.searchEmployee || 'Unknown'),
      detail: f.category,
      time: this.calculateTimeAgo(f.date), // Dynamic Time
      colorClass: f.status === 'Resolved' ? 'emerald' : (f.status === 'Acknowledged' ? 'blue' : 'amber')
    }));
  } //this is used to refresh activity times dynamically  in the dashboard in real-time count

  refreshActivityTimes() {
    this.activities.forEach(a => {
      a.time = this.calculateTimeAgo(a.date);
    });
  } //this is used to calculate time ago from a given date string

  calculateTimeAgo(dateString: string): string {
    if (!dateString) return '1 min ago';
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));

    if (diffInMins <= 1) return '1 min ago';
    if (diffInMins < 60) return `${diffInMins} min ago`;
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return past.toLocaleDateString();
  } //this is used to load category distribution data for the chart

  loadCategoryDistribution() {
    let allFeedback = this.managerService.getAllFeedback(); // Get all feedback
    
    // Filter by status if not 'All'
    if (this.statusFilter !== 'All') {
      allFeedback = allFeedback.filter(f => f.status === this.statusFilter);
    }

    const categories: { [key: string]: number } = {};
    allFeedback.forEach(f => {
      const cat = f.category || 'Other';
      categories[cat] = (categories[cat] || 0) + 1;
    }); // Count feedback per category

    const total = allFeedback.length || 1;  // Avoid division by zero
    const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];// Predefined color classes

    this.categoryData = Object.keys(categories).map((name, index) => ({
      name: name,
      count: categories[name],
      percent: Math.round((categories[name] / total) * 100),
      colorClass: colors[index % colors.length]
    })).sort((a, b) => b.count - a.count);
  }  //this is used to handle filter changes for category distribution

  onFilterChange(status: string) {
    this.statusFilter = status;
    this.loadCategoryDistribution();
  } // Clean up timers on component destroy

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.timeUpdateTimer) clearInterval(this.timeUpdateTimer);
  }//this is used to get filtered activities based on search query

  get filteredActivities() {
    return this.activities.filter(a => 
      a.user.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
      a.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }//this is used to animate the dashboard statistics on load

  animate() {
    const steps = 60;
    const interval = 1000 / steps;// 1 second animation
    let i = 0;

    this.timer = setInterval(() => {
      i++;
      const ratio = i / steps;
      this.display.totalFeedback = Math.round(this.data.totalFeedback * ratio);
      this.display.pendingReviews = Math.round(this.data.pendingReviews * ratio);
      this.display.engagementScore = Math.round(this.data.engagementScore * ratio);
      this.display.acknowledged = Math.round(this.data.acknowledged * ratio);  // Update displayed values

      if (i === steps) clearInterval(this.timer);
    }, interval);// Animate over 1 second
  }

  downloadReport() {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Dashboard Report', 14, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${timestamp}`, 14, 32);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(14);
    doc.text('Executive Summary', 14, 55);

    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Value']],
      body: [
        ['Total Feedback Received', this.data.totalFeedback.toString()],
        ['Pending Action Items', this.data.pendingReviews.toString()],
        ['Acknowledged/Resolved', this.data.acknowledged.toString()],
        ['Engagement Score', `${this.data.engagementScore}%`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      styles: { fontSize: 11, cellPadding: 5 }
    }); //this is used to add category distribution table in the PDF

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Category Distribution', 14, finalY);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Category', 'Count', 'Percentage']],
      body: this.categoryData.map(c => [c.name, c.count.toString(), `${c.percent}%`]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });//this is used to add footer note in the PDF

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('This is an automated system report for management review.', 14, pageHeight - 10);

    doc.save(`Performance_Report_${Date.now()}.pdf`);
  }//this is used to calculate time ago from a given date string  
}