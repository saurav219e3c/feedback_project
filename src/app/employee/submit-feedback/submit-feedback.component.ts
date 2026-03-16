import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService, Feedback, Category } from '../service/employee.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-submit-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './submit-feedback.component.html',
  styleUrl: './submit-feedback.component.css'
})
export class SubmitFeedbackComponent implements OnInit {

  feedbackForm!: FormGroup;
  employees: any[] = [];
  categories: Category[] = [];

  // SIGNALS for UI State
  filteredEmployees = signal<any[]>([]);
  selectedEmp = signal<any>(null);
  isSearching = signal<boolean>(false);

  // Settings-related properties
  allowAnonymous = true;
  minFeedbackLength = 10;
  requireCategory = true;

  constructor(private fb: FormBuilder, private empService: EmployeeService) { }

  ngOnInit(): void {
    this.employees = this.empService.getAllEmployees();

    this.empService.getCategories().subscribe(cats => {
      this.categories = cats;
    });

    this.empService.getSettings().subscribe(settings => {
      if (settings) {
        this.allowAnonymous = settings.feedbackSettings.allowAnonymousFeedback;
        this.minFeedbackLength = settings.feedbackSettings.minimumFeedbackLength;
        this.requireCategory = settings.feedbackSettings.requireCategorySelection;
        this.updateFormValidators();
      }
    });

    this.feedbackForm = this.fb.group({
      employeeName: ['', Validators.required],
      employeeId: ['', Validators.required],
      category: ['', this.requireCategory ? Validators.required : []],
      comments: ['', [Validators.required, Validators.minLength(this.minFeedbackLength)]],
      isAnonymous: [false],
      submissionDate: [new Date().toISOString().substring(0, 10), Validators.required]
    });
  }

  onNameChange(event: any) {
    const query = event.target.value.trim();
    this.selectedEmp.set(null);
    this.feedbackForm.get('employeeId')?.setValue('', { emitEvent: false });

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
    this.feedbackForm.get('employeeName')?.setValue('', { emitEvent: false });

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
    this.feedbackForm.patchValue({
      employeeName: emp.name || emp.fullName,
      employeeId: emp.id || emp.userId
    }, { emitEvent: false });
    this.filteredEmployees.set([]);
  }

  private updateFormValidators(): void {
    const categoryControl = this.feedbackForm.get('category');
    const commentsControl = this.feedbackForm.get('comments');

    if (categoryControl) {
      categoryControl.setValidators(this.requireCategory ? Validators.required : []);
      categoryControl.updateValueAndValidity();
    }

    if (commentsControl) {
      commentsControl.setValidators([
        Validators.required,
        Validators.minLength(this.minFeedbackLength)
      ]);
      commentsControl.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.feedbackForm.valid) {
      const formValue = this.feedbackForm.getRawValue();

      if (!formValue.employeeId || formValue.employeeId.trim() === '') {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Employee',
          text: 'Please enter or select a valid Employee ID.',
          confirmButtonColor: '#6366f1'
        });
        return;
      }

      const isAnonymous = formValue.isAnonymous;

      if (isAnonymous && !this.allowAnonymous) {
        Swal.fire({
          icon: 'error',
          title: 'Not Allowed',
          text: 'Anonymous feedback is not allowed by system settings.',
          confirmButtonColor: '#6366f1'
        });
        return;
      }

      // Confirmation before submit
      Swal.fire({
        title: 'Submit Feedback?',
        text: isAnonymous ? 'This will be submitted anonymously.' : 'Are you sure you want to submit this feedback?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Yes, Submit!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          const finalData = {
            targetUserId: formValue.employeeId,
            category: formValue.category,
            comments: formValue.comments,
            isAnonymous: isAnonymous
          };

          this.empService.saveFeedback(finalData).subscribe({
            next: (response) => {
              console.log('Feedback saved successfully', response);
              Swal.fire({
                icon: 'success',
                title: 'Submitted!',
                text: 'Your feedback has been submitted successfully.',
                confirmButtonColor: '#6366f1',
                timer: 2500,
                timerProgressBar: true
              });
              this.resetForm();
            },
            error: (error) => {
              console.error('Error saving feedback:', error);
              const errorMsg = error.error?.message || 'Error submitting feedback. Please try again.';
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
      this.feedbackForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.feedbackForm.reset({
      submissionDate: new Date().toISOString().substring(0, 10),
      isAnonymous: false
    });
    this.selectedEmp.set(null);
    this.filteredEmployees.set([]);
  }
}