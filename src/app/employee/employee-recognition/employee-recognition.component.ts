import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EmployeeService, Recognition, Badge } from '../service/employee.service';
import Swal from 'sweetalert2';

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
  badges: Badge[] = [];

  filteredEmployees = signal<any[]>([]);
  selectedEmp = signal<any>(null);
  isSearching = signal<boolean>(false);

  // Settings-related properties
  maxPoints = 10;
  monthlyBudget = 100;

  constructor() {
    this.recognitionForm = this.fb.group({
      employeeName: ['', Validators.required],
      employeeId: ['', Validators.required],
      badgeType: ['', Validators.required],
      points: [5, [Validators.required, Validators.min(1), Validators.max(this.maxPoints)]],
      comment: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.employees = this.empService.getAllEmployees();

    this.empService.getBadges().subscribe(badges => {
      this.badges = badges;
    });

    this.empService.getSettings().subscribe(settings => {
      if (settings) {
        this.maxPoints = settings.recognitionSettings.maxPointsPerRecognition;
        this.monthlyBudget = settings.recognitionSettings.monthlyPointsBudgetPerEmployee;

        const pointsControl = this.recognitionForm.get('points');
        if (pointsControl) {
          pointsControl.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(this.maxPoints)
          ]);
          pointsControl.updateValueAndValidity();
        }
      }
    });
  }

  get f() { return this.recognitionForm.controls; }

  getBadgeTheme() {
    const badge = this.recognitionForm.get('badgeType')?.value;
    if (badge === 'Leader') return 'border-danger text-danger';
    if (badge === 'Team Player') return 'border-success text-success';
    if (badge === 'Problem Solver') return 'border-info text-info';
    if (badge === 'Innovator') return 'border-warning text-warning';
    return 'border-primary';
  }

  onNameChange(event: any) {
    const query = event.target.value.trim();
    this.selectedEmp.set(null);
    this.recognitionForm.get('employeeId')?.setValue('', { emitEvent: false });

    if (query.length > 1) {
      this.isSearching.set(true);
      this.empService.searchEmployees(query).subscribe({
        next: (results) => {
          this.filteredEmployees.set(results);
          this.isSearching.set(false);
        },
        error: (err) => {
          console.error('Search error:', err);
          this.isSearching.set(false);
        }
      });
    } else {
      this.filteredEmployees.set([]);
      this.isSearching.set(false);
    }
  }

  onEmployeeIdChange(event: any) {
    const empId = event.target.value.trim();
    this.selectedEmp.set(null);
    this.recognitionForm.get('employeeName')?.setValue('', { emitEvent: false });

    if (empId.length > 1) {
      this.isSearching.set(true);
      this.empService.searchEmployees(empId).subscribe(results => {
        this.filteredEmployees.set(results);
        this.isSearching.set(false);
        const exactMatch = results.find(emp =>
          emp.id?.toLowerCase() === empId.toLowerCase() ||
          emp.userId?.toLowerCase() === empId.toLowerCase()
        );
        if (exactMatch) {
          this.selectEmployee(exactMatch);
        }
      });
    } else {
      this.filteredEmployees.set([]);
      this.isSearching.set(false);
    }
  }

  selectEmployee(emp: any) {
    this.selectedEmp.set(emp);
    this.recognitionForm.patchValue({
      employeeName: emp.name || emp.fullName,
      employeeId: emp.id || emp.userId
    }, { emitEvent: false });
    this.filteredEmployees.set([]);
  }

  onSubmit() {
    const rawForm = this.recognitionForm.getRawValue();

    if (!rawForm.employeeId || rawForm.employeeId.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Employee',
        text: 'Please enter or select a valid Employee ID.',
        confirmButtonColor: '#6366f1'
      });
      this.recognitionForm.markAllAsTouched();
      return;
    }

    if (this.recognitionForm.valid) {
      if (rawForm.points > this.maxPoints) {
        Swal.fire({
          icon: 'error',
          title: 'Points Exceeded',
          text: `Maximum points per recognition is ${this.maxPoints}. Please adjust.`,
          confirmButtonColor: '#6366f1'
        });
        return;
      }

      const empName = this.selectedEmp()?.name || this.selectedEmp()?.fullName || rawForm.employeeId;

      Swal.fire({
        title: 'Send Recognition?',
        text: `Award ${rawForm.points} points to ${empName}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Yes, Send!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          const recognitionData = {
            toUserId: rawForm.employeeId,
            badgeId: rawForm.badgeType,
            points: rawForm.points,
            message: rawForm.comment
          };

          this.empService.saveRecognition(recognitionData).subscribe({
            next: (response) => {
              console.log('Recognition saved successfully', response);
              Swal.fire({
                icon: 'success',
                title: 'Recognition Sent!',
                text: `You've recognized ${empName} with ${rawForm.points} points!`,
                confirmButtonColor: '#6366f1',
                timer: 2500,
                timerProgressBar: true
              });
              this.resetForm();
            },
            error: (error) => {
              console.error('Error saving recognition:', error);
              const errorMsg = error.error?.message || 'Error sending recognition. Please try again.';
              Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: errorMsg,
                confirmButtonColor: '#6366f1'
              });
            }
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill in all required fields and select an employee.',
        confirmButtonColor: '#6366f1'
      });
      this.recognitionForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.recognitionForm.reset({
      points: 5,
      badgeType: '',
      employeeName: ''
    });
    this.selectedEmp.set(null);
    this.filteredEmployees.set([]);
  }
}