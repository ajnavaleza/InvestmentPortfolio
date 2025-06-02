import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Only add auth headers for external APIs (Alpha Vantage)
  // Firebase SDK handles its own authentication
  if (isExternalApiCall(req.url)) {
    const authToken = authService.getToken();

    if (authToken) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => handleError(error, authService, router))
      );
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => handleError(error, authService, router))
  );
};

function isExternalApiCall(url: string): boolean {
  return url.includes('alphavantage.co') || 
         url.includes('api.') || 
         (!url.includes('firestore') && !url.includes('firebase'));
}

function handleError(error: HttpErrorResponse, authService: AuthService, router: Router) {
  if (error.status === 401) {
    authService.logout().subscribe();
    router.navigate(['/login']);
  }
  
  return throwError(() => error);
} 