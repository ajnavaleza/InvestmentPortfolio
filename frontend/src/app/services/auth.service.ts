/**
 * Authentication Service
 * 
 * Purpose: Manages user authentication, login/logout, and session management
 * Connected to: 
 *   - DashboardComponent for user display and logout
 *   - LoginComponent for authentication
 *   - AuthGuard for route protection
 *   - HTTP backend APIs for authentication
 * Used by: Components and guards that need user authentication
 * 
 * Features:
 * - User login and registration
 * - JWT token management
 * - User session persistence
 * - Mock authentication for development
 * - Observable user state management
 */

// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, delay, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id?: number;
  username: string;
  email?: string;
  password?: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  username: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  tokenType: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mock data
  private mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com'
  };

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  register(user: User): Observable<RegisterResponse> {
    if (environment.useMockBackend) {
      return this.mockRegister(user);
    }
    
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, user)
      .pipe(
        tap(response => {
          this.setTokens(response.accessToken);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  login(username: string, password: string): Observable<LoginResponse> {
    if (environment.useMockBackend) {
      return this.mockLogin(username, password);
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          this.setTokens(response.accessToken);
          this.currentUserSubject.next({ username: response.username });
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): Observable<User> {
    if (environment.useMockBackend) {
      return this.mockGetCurrentUser();
    }
    
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setTokens(accessToken: string): void {
    localStorage.setItem('access_token', accessToken);
  }

  private loadStoredUser(): void {
    const token = this.getToken();
    if (token) {
      this.getCurrentUser().subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    }
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    return new HttpHeaders();
  }

  // Mock methods
  private mockLogin(username: string, password: string): Observable<LoginResponse> {
    if (username === 'testuser' && password === 'password') {
      const response: LoginResponse = {
        accessToken: 'mock-jwt-token-12345',
        tokenType: 'Bearer',
        username: username
      };
      
      return of(response).pipe(
        delay(500),
        tap(response => {
          this.setTokens(response.accessToken);
          this.currentUserSubject.next({ username: response.username });
        })
      );
    } else {
      return throwError(() => ({ error: { error: 'Invalid credentials' } })).pipe(delay(500));
    }
  }

  private mockRegister(user: User): Observable<RegisterResponse> {
    const response: RegisterResponse = {
      user: { ...user, id: Date.now() },
      accessToken: 'mock-jwt-token-12345',
      tokenType: 'Bearer'
    };
    
    return of(response).pipe(
      delay(500),
      tap(response => {
        this.setTokens(response.accessToken);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  private mockGetCurrentUser(): Observable<User> {
    return of(this.mockUser).pipe(delay(300));
  }
}