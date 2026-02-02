import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService, Feedback } from '../service/employee.service';
import { CategoryManagementComponent } from '../../admin/category-management/category-management.component';


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

  employees: any[] = [];

  categories = this.catagory_inj.categories;

  constructor(private fb: FormBuilder, private empService: EmployeeService) { }

  ngOnInit(): void {

    this.employees = this.empService.getAllEmployees();



    this.feedbackForm = this.fb.group({
      searchEmployee: ['', Validators.required],
      // 2. Keep this disabled so users don't type manually; let the logic fill it
      employeeId: [{ value: '', disabled: true }, Validators.required],
      category: ['', Validators.required],
      comments: ['', [Validators.required, Validators.minLength(10)]],
      isAnonymous: [false],
      submissionDate: [new Date().toISOString().substring(0, 10), Validators.required]
    });

    // 3. AUTO-FILL LOGIC: Listen to search box changes
    this.feedbackForm.get('searchEmployee')?.valueChanges.subscribe(name => {
      const selected = this.employees.find(e => e.name === name);
      if (selected) {
        this.feedbackForm.get('employeeId')?.setValue(selected.id);
      }
    });

  }

  onSubmit(): void {
    if (this.feedbackForm.valid) {
      const formValue = this.feedbackForm.getRawValue();

      const isAnonymous = formValue.isAnonymous;

      const finalData: Feedback = {
        feedbackId: '', // Service will fill this

        // ADDED: Who is sending this? (Get from Service)
        submittedByUserId: isAnonymous ? 'Anonymous' : this.empService.getCurrentUser(),

        // ADDED: Who is this for? (Map it from the form's 'employeeId')
        targetUserId: formValue.employeeId,

        // Existing Form Data
        searchEmployee: formValue.searchEmployee,
        category: formValue.category,
        comments: formValue.comments,
        isAnonymous: isAnonymous,
        submissionDate: formValue.submissionDate


      };

      this.empService.saveFeedback(finalData);

      console.log('final Data Saved', finalData);

      alert('successs');

      this.feedbackForm.reset({
        submissionDate: new Date().toISOString().substring(0, 10),
        isAnonymous: false
      });
    } else {
      this.feedbackForm.markAllAsTouched();
    }
  }
}