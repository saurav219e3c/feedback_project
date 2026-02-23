import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterService } from '../service/register.service';
import { AdminDepartmentService, DepartmentReadDto } from '../../admin/services/admin-dapartment.service';

@Component({
  selector: 'app-manager-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manager-register-page.component.html',
  styleUrls: ['./manager-register-page.component.css'],
})
export class ManagerRegisterPageComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingDepartments = false;

  departments: DepartmentReadDto[] = [];

  userIdPattern = /^mng[0-9]{4}$/i;
  passwordPattern =
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registerService: RegisterService,
    private departmentService: AdminDepartmentService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        userId: [
          '',
          [Validators.required, Validators.pattern(this.userIdPattern)],
        ],
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(80),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        department: ['', [Validators.required]],
        password: [
          '',
          [Validators.required, Validators.pattern(this.passwordPattern)],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatchValidator },
    );

    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loadingDepartments = true;
    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments = data.filter(dept => dept.isActive);
        this.loadingDepartments = false;
      },
      error: (err) => {
        console.error('Failed to load departments:', err);
        this.loadingDepartments = false;
        this.departments = [];
      }
    });
  }

  private passwordsMatchValidator(
    group: AbstractControl,
  ): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (!password || !confirm) return null;
    return password === confirm ? null : { passwordMismatch: true };
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const payload = {
      userId: this.form.getRawValue().userId,
      fullName: this.form.getRawValue().name,
      email: this.form.getRawValue().email,
      departmentId: this.form.getRawValue().department,
      password: this.form.getRawValue().password,
    };

    this.registerService.registerManager(payload).subscribe({
      next: () => {
        alert('Manager registration successful! You can now log in.');
        this.router.navigate(['/auth/login-page'], {
          queryParams: { role: 'manager' },
        });
      },
      error: (err) => {
        const msg = err?.error?.message || 'Registration failed.';
        alert(msg);
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login-page'], {
      queryParams: { role: 'manager' },
    });
  }
}
