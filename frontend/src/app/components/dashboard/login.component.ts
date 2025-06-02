import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/interfaces';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Investment Portfolio</mat-card-title>
          <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="password" required>
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" 
                      [attr.aria-label]="'Hide password'" [attr.aria-pressed]="hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="loginForm.invalid || isLoading" class="full-width">
                <mat-icon *ngIf="isLoading">refresh</mat-icon>
                {{isLoading ? 'Signing in...' : 'Sign In'}}
              </button>
            </div>
          </form>

          <div class="register-link">
            <p>Don't have an account? <a routerLink="/register">Create one here</a></p>
          </div>

          <div class="demo-info">
            <h4>Demo Credentials:</h4>
            <p><strong>Email:</strong> test@test.com</p>
            <p><strong>Password:</strong> password</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      margin-top: 1rem;
    }

    .register-link {
      text-align: center;
      margin-top: 1rem;
      
      a {
        color: #3f51b5;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }

    .demo-info {
      margin-top: 2rem;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 4px;
      border-left: 4px solid #3f51b5;

      h4 {
        margin: 0 0 0.5rem 0;
        color: #3f51b5;
      }

      p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
      }
    }

    mat-form-field {
      margin-bottom: 1rem;
    }

    mat-icon[matSuffix] {
      cursor: pointer;
    }

    mat-card-title {
      text-align: center;
    }

    mat-card-subtitle {
      text-align: center;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      const loginData: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };
      
      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('Login successful!', 'Close', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
          this.snackBar.open(errorMessage, 'Close', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}