import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EmployeeService, Recognition } from '../service/employee.service';

@Component({
  selector: 'app-employee-recognition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-recognition.component.html',
  styleUrl: './employee-recognition.component.css'
})
export class EmployeeRecognitionComponent implements OnInit {
  
  
  private fb = inject(FormBuilder);
  private empService = inject(EmployeeService);

  recognitionForm: FormGroup;
  employees: any[] = []; 

  // 2. SIGNALS for UI State (The Angular 19 Way)
  filteredEmployees = signal<any[]>([]); 
  selectedEmp = signal<any>(null);

  constructor() {
    this.recognitionForm = this.fb.group({
      employeeSearch: ['', Validators.required],
      employeeId: [{ value: '', disabled: true }], 
      badgeType: ['', Validators.required],
      points: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      comment: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.employees = this.empService.getAllEmployees();
  }

  // Getter for easy access in HTML
  get f() { return this.recognitionForm.controls; }

  // Dynamic color helper
  getBadgeTheme() {
    const badge = this.recognitionForm.get('badgeType')?.value;
    if (badge === 'Leader') return 'border-danger text-danger';
    if (badge === 'Team Player') return 'border-success text-success';
    if (badge === 'Problem Solver') return 'border-info text-info';
    if (badge === 'Innovator') return 'border-warning text-warning';
    return 'border-primary';
  }

  onSearchChange(event: any) {
    const query = event.target.value.toLowerCase();
    
    // Reset selected signal because user started typing again
    this.selectedEmp.set(null); 

    if (query.length > 1) {
      const results = this.employees.filter(emp => 
        emp.name.toLowerCase().includes(query) || emp.id.toLowerCase().includes(query)
      );
      // Update Signal
      this.filteredEmployees.set(results);
    } else {
      this.filteredEmployees.set([]);
    }
  }

  selectEmployee(emp: any) {
    // Set the signal
    this.selectedEmp.set(emp);
    
    // Patch the Reactive Form
    this.recognitionForm.patchValue({
      employeeSearch: emp.name,
      employeeId: emp.id
    });
    
    // Clear the dropdown list
    this.filteredEmployees.set([]);
  }

  onSubmit() {
    // Check signal value using parentheses: this.selectedEmp()
    if (this.recognitionForm.valid && this.selectedEmp()) {
      const rawForm = this.recognitionForm.getRawValue();

      const recognitionData: Recognition = {
        fromUserId: this.empService.getCurrentUser(), 
        toUserId: rawForm.employeeId,
        BadgeType: rawForm.badgeType,
        points: rawForm.points,
        comment: rawForm.comment,
        date: new Date().toISOString().substring(0, 10)
      };

      this.empService.saveRecognition(recognitionData);

      console.log('Saved to DB:', recognitionData);
      alert(`🎉 Recognition Sent to ${this.selectedEmp().name}!`);
      
      this.recognitionForm.reset({
        points: 5,
        badgeType: '',
        employeeSearch: ''
      });
      
      this.selectedEmp.set(null);
    }
  }
}