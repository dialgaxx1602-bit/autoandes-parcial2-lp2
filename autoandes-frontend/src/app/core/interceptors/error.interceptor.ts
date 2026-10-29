import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        const returnUrl = router.routerState.snapshot.url;
        authService.logout(returnUrl);
      } else if (error.status === 403) {
        
        console.warn('Acceso denegado (403): Permisos insuficientes');
      }

      return throwError(() => error);
    })
  );
};
