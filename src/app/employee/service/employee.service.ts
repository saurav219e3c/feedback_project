import { inject, Injectable } from "@angular/core";
import { AuthService } from "../../core/services/auth.service";
import { Observable, of } from "rxjs";


export interface Feedback {
  id?: number;
  feedbackId?: string;
  submittedByUserId: string;
  targetUserId: string;
  searchEmployee?: string;
  category: string;
  comments: string;
  isAnonymous: boolean;
  submissionDate: string;
}

export interface Recognition {
  id?: number;
  recognitionId?: string;
  fromUserId: string;
  toUserId: string;
  BadgeType: string;
  points: number;
  date: string;
  comment?: string;
}


export interface Employee {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private authService = inject(AuthService);

  // Storage Keys
  private readonly KEYS = {
    FEEDBACK: 'feedback_db',
    RECOGNITION: 'recognition_db',
    USERS: 'feedback_project_users'
  };

  //  Variables  
  private feedbackList: Feedback[] = [];
  private recognitionList: Recognition[] = [];

  constructor() { 
    this.loadData();
  }

  //. INTERNAL HELPERS --

  private loadData() {
    // Load Feedback
    const fbData = localStorage.getItem(this.KEYS.FEEDBACK);
    this.feedbackList = fbData ? JSON.parse(fbData) : [];

    // Load Recognition
    const recData = localStorage.getItem(this.KEYS.RECOGNITION);
    this.recognitionList = recData ? JSON.parse(recData) : [];
  }

  private saveToStorage() {
    localStorage.setItem(this.KEYS.FEEDBACK, JSON.stringify(this.feedbackList));
    localStorage.setItem(this.KEYS.RECOGNITION, JSON.stringify(this.recognitionList));
  }
  

  getCurrentUserId(): string | null {
    return this.authService.getCurrentUserId() ?? '';
  }

  getCurrentUser(): string {
    return this.getCurrentUserId() ?? 'unknown';
  }

  // --- 3. FEEDBACK LOGIC ---

  getAllFeedback() { 
    return this.feedbackList; 
  }

  getMyReceivedFeedback() {
    const myId = this.getCurrentUserId();
    return this.feedbackList.filter(f => f.targetUserId === myId);
  }

  getMySentFeedback() {
    const myId = this.getCurrentUserId();
    return this.feedbackList.filter(f => f.submittedByUserId === myId);
  }

  saveFeedback(data: Feedback) {
    data.feedbackId = 'FB-' + Date.now();
    data.id = Date.now();
    
    this.feedbackList.push(data);
    this.saveToStorage(); 
  }

  // --- 4. RECOGNITION LOGIC ---

  getAllRecognitions() {
    return this.recognitionList;
  }

  getMyRecognitions() {
    const myId = this.getCurrentUserId();
    return this.recognitionList.filter(r => r.toUserId === myId);
  }

  getMySentRecognition() {
    const myId = this.getCurrentUserId();
    return this.recognitionList.filter(r => r.fromUserId === myId);
  }

  saveRecognition(data: Recognition) {
    const newEntry = {
      ...data,
      id: Date.now(),
      recognitionId: 'REC-' + Date.now()
    };

    this.recognitionList.push(newEntry);
    this.saveToStorage();
  }

  // --- 5. DASHBOARD STATS ---

  getDasboardStats(): Observable<any[]> {
    const sentFb = this.getMySentFeedback().length;
    const receivedFb = this.getMyReceivedFeedback().length;
    const sentRec = this.getMySentRecognition().length;
    
    const totalPoints = this.getMyRecognitions().reduce((sum, item) => sum + (item.points || 0), 0);

    return of([
      { label: 'Feedback Given', value: sentFb, trend: 12, icon: 'bi-pencil-square', bgClass: 'bg-primary-soft' },
      { label: 'Feedback Received', value: receivedFb, trend: 5, icon: 'bi-chat-left-dots', bgClass: 'bg-warning-soft' },
      { label: 'Recognition Given', value: sentRec, trend: 8, icon: 'bi-star', bgClass: 'bg-info-soft' },
      { label: 'Points Earned', value: totalPoints, trend: 20, icon: 'bi-award', bgClass: 'bg-success-soft' }
    ]);
  }

  // --- 6. EMPLOYEE LIST ---

  // I added ': Employee[]' here so TypeScript knows what this returns
  getAllEmployees(): Employee[] {
    
    const data = localStorage.getItem(this.KEYS.USERS);
    if (!data) return [];
    
    try {
      const users = JSON.parse(data);
      const myId = this.getCurrentUserId();
      
      return users
        .filter((u: any) => u.userId !== myId && ['employee', 'manager'].includes(u.role?.toLowerCase()))
        .map((u: any) => ({ id: u.userId, name: u.name || u.username }));
    } catch { 
      return []; 
    }
  }

  getEmployeeName(id: string): string {
    
    const emp = this.getAllEmployees().find(e => e.id === id);
    return emp ? emp.name : id;
  }

}






