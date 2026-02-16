import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { EmployeeService, Feedback, Employee } from '../../services/employee.service';
import { CategoryManagementComponent } from '../../../admin/category-management/category-management.component';


@Component({
  selector: 'app-submit-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './submit-feedback.component.html',
  styleUrl: './submit-feedback.component.css'
})
export class SubmitFeedbackComponent implements OnInit {

  private catagory_inj = inject(CategoryManagementComponent); //

  feedbackForm!: FormGroup;

  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];

  categories = this.catagory_inj.categories;

  constructor(private fb: FormBuilder, private empService: EmployeeService) { }

  ngOnInit(): void {

    this.employees = this.empService.getAllEmployees();
    this.feedbackForm = this.fb.group({
      searchEmployee: ['', Validators.required],
      employeeId: [{ value: '', disabled: true }, Validators.required],
      category: ['', Validators.required],
      comments: ['', [Validators.required, Validators.minLength(10)]],
      isAnonymous: [false],
      submissionDate: [new Date().toISOString().substring(0, 10), Validators.required]
    });

    this.feedbackForm.get('searchEmployee')?.valueChanges.subscribe(value => {
      const term = (value ?? '').toString().trim().toLowerCase();
      this.updateFilteredEmployees(term);

      const selected = this.employees.find(e =>
        e.name.toLowerCase() === term || e.id.toLowerCase() === term
      );
      if (selected) {
        this.feedbackForm.get('employeeId')?.setValue(selected.id);
      } else {
        this.feedbackForm.get('employeeId')?.setValue('');
      }
    });

  }

  onSearchChange(event: Event): void {
    const term = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.updateFilteredEmployees(term);
  }

  selectEmployee(emp: Employee): void {
    this.feedbackForm.get('searchEmployee')?.setValue(emp.name, { emitEvent: true });
    this.feedbackForm.get('employeeId')?.setValue(emp.id);
    this.filteredEmployees = [];
  }

  private updateFilteredEmployees(term: string): void {
    if (!term) {
      this.filteredEmployees = [];
      return;
    }
    this.filteredEmployees = this.employees
      .filter(e => e.name.toLowerCase().includes(term) || e.id.toLowerCase().includes(term))
      .slice(0, 6);
  }

  onSubmit(): void {
    if (this.feedbackForm.valid) {
      const formValue = this.feedbackForm.getRawValue();

      const isAnonymous = formValue.isAnonymous;

      const finalData: Feedback = {
        feedbackId: '', 
        submittedByUserId: isAnonymous ? 'Anonymous' : this.empService.getCurrentUser(),
        targetUserId: formValue.employeeId,
        searchEmployee: formValue.searchEmployee,
        category: formValue.category,
        comments: formValue.comments,
        isAnonymous: isAnonymous,
        submissionDate: formValue.submissionDate


      };

      this.empService.saveFeedback(finalData);

      console.log('final Data Saved', finalData);

      Swal.fire({
        icon: 'success',
        title: 'Feedback Sent',
        text: 'Thanks for sharing your feedback.',
        timer: 2000,
        showConfirmButton: false
      });

      this.feedbackForm.reset({
        submissionDate: new Date().toISOString().substring(0, 10),
        isAnonymous: false
      });
    } else {
      this.feedbackForm.markAllAsTouched();
    }
  }
}