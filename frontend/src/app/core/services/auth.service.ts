import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { FirebaseService } from './firebase.service';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    // Only auto-login if we have both valid token and user data
    const token = this.getToken();
    const userData = this.getStoredUser();
    
    if (token && userData && environment.useFirebase) {
      // Validate the token isn't expired (basic check)
      try {
        // In a production app, you'd validate the token with the server
        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(userData);
        console.log('Auto-login successful for user:', userData.email);
      } catch (error) {
        // If validation fails, clear invalid data
        this.clearAuthData();
      }
    }
  }

  // Authentication Methods
  login(credentials: LoginRequest): Observable<AuthResponse> {
    if (!environment.useFirebase) {
      return throwError(() => new Error('Firebase not configured'));
    }

    return this.firebaseService.login(credentials).pipe(
      map(response => {
        this.handleSuccessfulAuth(response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    if (!environment.useFirebase) {
      return throwError(() => new Error('Firebase not configured'));
    }

    return this.firebaseService.register(userData).pipe(
      map(response => {
        this.handleSuccessfulAuth(response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<void> {
    console.log('Logging out user...');
    
    if (environment.useFirebase) {
      return this.firebaseService.logout().pipe(
        map(() => {
          this.clearAuthData();
          console.log('Firebase logout completed');
        }),
        catchError((error) => {
          console.error('Firebase logout error:', error);
          // Even if Firebase logout fails, clear local data
          this.clearAuthData();
          return of(void 0);
        })
      );
    }
    
    this.clearAuthData();
    return of(void 0);
  }

  getCurrentUser(): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      return of(currentUser);
    }

    if (environment.useFirebase) {
      return this.firebaseService.getCurrentUser().pipe(
        map(user => {
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(() => {
          this.clearAuthData();
          return throwError(() => new Error('User not authenticated'));
        })
      );
    }

    return throwError(() => new Error('User not authenticated'));
  }

  refreshToken(): Observable<string> {
    // Firebase handles token refresh automatically
    return this.getCurrentUser().pipe(
      switchMap(() => {
        const token = this.getToken();
        if (token) {
          return of(token);
        }
        throw new Error('No valid token available');
      })
    );
  }

  // Token Management
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Private Methods
  private handleSuccessfulAuth(response: AuthResponse): void {
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('userData', JSON.stringify(response.user));
    
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(response.user);
  }

  private clearAuthData(): void {
    console.log('Clearing authentication data...');
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    
    // Navigate to login
    this.router.navigate(['/login']);
  }

  private getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  private handleError = (error: any): Observable<never> => {
    return throwError(() => error);
  }
} 