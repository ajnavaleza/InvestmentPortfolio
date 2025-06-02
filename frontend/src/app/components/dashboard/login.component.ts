import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTabsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Investment Portfolio</mat-card-title>
        </mat-card-header>
        
        <mat-tab-group>
          <mat-tab label="Login">
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="form-container">
              <mat-form-field appearance="outline">
                <mat-label>Username</mat-label>
                <input matInput formControlName="username" required>
                <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                  Username is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password" required>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="loginForm.invalid || isLogging">
                {{isLogging ? 'Logging in...' : 'Login'}}
              </button>
            </form>
          </mat-tab>

          <mat-tab label="Register">
            <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="form-container">
              <mat-form-field appearance="outline">
                <mat-label>Username</mat-label>
                <input matInput formControlName="username" required>
                <mat-error *ngIf="registerForm.get('username')?.hasError('required')">
                  Username is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email">
                <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password" required>
                <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                  Password must be at least 6 characters
                </mat-error>
              </mat-form-field>

              <button mat-raised-button color="accent" type="submit" 
                      [disabled]="registerForm.invalid || isRegistering">
                {{isRegistering ? 'Registering...' : 'Register'}}
              </button>
            </form>
          </mat-tab>
        </mat-tab-group>
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
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 20px;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px 0;
    }

    mat-form-field {
      width: 100%;
    }

    button {
      height: 48px;
      font-size: 16px;
    }

    mat-card-title {
      text-align: center;
      color: #333;
      margin-bottom: 20px;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLogging = false;
  isRegistering = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.email],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLogging = true;
      const { username, password } = this.loginForm.value;
      
      this.authService.login(username, password).subscribe({
        next: (response) => {
          this.isLogging = false;
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLogging = false;
          this.snackBar.open('Login failed. Please check your credentials.', 'Close', { duration: 5000 });
          console.error('Login error:', error);
        }
      });
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.isRegistering = true;
      const userData = this.registerForm.value;
      
      this.authService.register(userData).subscribe({
        next: (response) => {
          this.isRegistering = false;
          this.snackBar.open('Registration successful! You are now logged in.', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isRegistering = false;
          const errorMessage = error.error?.error || 'Registration failed. Please try again.';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          console.error('Registration error:', error);
        }
      });
    }
  }
}