import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const invitadoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};

export const permisoGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const permisoRequerido = route.data?.['permiso'] as string | undefined;

  if (!permisoRequerido || authService.tienePermiso(permisoRequerido)) {
    return true;
  }

  
  router.navigate(['/acceso-denegado']);
  return false;
};
