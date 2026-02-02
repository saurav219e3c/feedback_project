// src/app/auth/register-page/register-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { RegisterService } from '../service/register.service';

type Role = 'manager' | 'employee'; // union

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css'],
})
export class RegisterPageComponent implements OnInit {
  
  form!: FormGroup;
  roleFromLogin?: Role;

  roles: Role[] = ['manager', 'employee'];
  departments: string[] = [
    'Engineering', 'Human Resources', 'Finance', 'Operations', 
    'Sales', 'Marketing', 'IT Support', 'Product'
  ];

  // Patterns
  // 3 letters followed by 4 digits
  userIdPattern = /^[a-z]{3}[0-9]{4}$/; 
  // Min 6 chars, 1 Uppercase, 1 Digit, 1 Special Char
  passwordPattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registerService: RegisterService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const role = params.get('role') as Role | null;
      this.roleFromLogin = role ?? undefined;
    });

    this.form = this.fb.group(
      {
        userId: ['', [Validators.required, Validators.pattern(this.userIdPattern)]],
        name: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(80)]],
        role: [this.roleFromLogin ?? 'employee', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        department: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
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

    this.registerService.registerUser(this.form.value).subscribe(success => {
      if (success) {
        alert('Registration successful!');
        this.router.navigate(['/auth/login-page'], {
          queryParams: { role: this.form.value.role },
        });
      } else {
        alert('User ID already exists. Please use a different one.');
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/home-page'], {
      queryParams: this.roleFromLogin ? { role: this.roleFromLogin } : undefined,
    });
  }
}