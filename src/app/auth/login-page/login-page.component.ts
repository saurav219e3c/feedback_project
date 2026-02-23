// src/app/auth/login-page/login-page.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from '../service/login.service';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginPageComponent implements OnInit {
  role?: string;
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private route: ActivatedRoute,
    private auth: AuthService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.role = params.get('role') ?? undefined;
    });
  }
  

  get f() { return this.form.controls; }

  onLogin() {

    debugger;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      
      return;
      
    }

    this.loading = true;

    const payload = {
      email: this.form.value.email,
      password: this.form.value.password
    };

    this.loginService.login(payload).subscribe({
      next: (res) => {
        // Save token + hydrate user from token (keeps your guards working)
        this.auth.loginWithToken(res.token);

        // Role normalization for redirect:
        const r = (this.role ?? res.user?.role ?? 'employee').toString().toLowerCase();
        const normalizedRole =
          r === 'admin' ? 'Admin' :
          r === 'manager' ? 'Manager' : 'Employee';

        const target =
          normalizedRole === 'Admin'   ? '/admin'   :
          normalizedRole === 'Manager' ? '/manager' :
                                         '/employee';

        // Show success alert then navigate
        Swal.fire({
          title: 'Welcome!',
          text: `Login successful. Redirecting to ${normalizedRole} dashboard...`,
          icon: 'success',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
          background: '#ffffff',
          color: '#1f2937'
        }).then(() => {
          this.router.navigate([target]);
        });
      },
      error: () => {
        Swal.fire({
          title: 'Login Failed',
          text: 'Invalid credentials or inactive user.',
          icon: 'error',
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#ef4444',
          background: '#ffffff',
          color: '#1f2937'
        });
      },
      complete: () => this.loading = false
    });
  }

  goToRegister() {
    // Only employee is allowed through public registration
    this.router.navigate(['/auth/register-page'], { queryParams: { role: 'employee' } });
  }

  onForgotPassword() {
    Swal.fire({
      title: 'Forgot Password',
      text: 'You can contact your administrator for password reset.',
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b82f6',
      background: '#ffffff',
      color: '#1f2937'
    });
  }
}