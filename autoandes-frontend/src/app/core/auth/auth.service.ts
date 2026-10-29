import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UsuarioActual } from '../models/autoandes.models';

const TOKEN_KEY = 'autoandes_token';
const EXPIRY_KEY = 'autoandes_expiry';
const USER_KEY = 'autoandes_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly tokenSignal = signal<string | null>(this.getInitialToken());
  private readonly userSignal = signal<UsuarioActual | null>(this.getInitialUser());

  readonly token = computed(() => this.tokenSignal());
  readonly usuario = computed(() => this.userSignal());
  readonly estaAutenticado = computed(() => !!this.tokenSignal() && !this.esTokenExpirado());
  readonly permisos = computed(() => this.userSignal()?.permisos || []);

  private timerExpiracion: any;

  constructor() {
    this.iniciarTemporizadorExpiracion();
  }

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credenciales).pipe(
      tap(res => {
        const expiracionTimestamp = Date.now() + (res.expiraEnSegundos * 1000);
        sessionStorage.setItem(TOKEN_KEY, res.token);
        sessionStorage.setItem(EXPIRY_KEY, expiracionTimestamp.toString());

        const user: UsuarioActual = {
          id: 0,
          username: credenciales.username,
          nombreCompleto: res.nombreCompleto,
          roles: res.roles,
          permisos: res.permisos
        };
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));

        this.tokenSignal.set(res.token);
        this.userSignal.set(user);
        this.iniciarTemporizadorExpiracion();
      })
    );
  }

  logout(returnUrl?: string): void {
    if (this.timerExpiracion) {
      clearTimeout(this.timerExpiracion);
    }
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRY_KEY);
    sessionStorage.removeItem(USER_KEY);

    this.tokenSignal.set(null);
    this.userSignal.set(null);

    if (returnUrl) {
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
    } else {
      this.router.navigate(['/login']);
    }
  }

  tienePermiso(permiso: string): boolean {
    return this.permisos().includes(permiso);
  }

  tieneAlgunPermiso(permisosRequeridos: string[]): boolean {
    const misPermisos = this.permisos();
    return permisosRequeridos.some(p => misPermisos.includes(p));
  }

  private esTokenExpirado(): boolean {
    const expiryStr = sessionStorage.getItem(EXPIRY_KEY);
    if (!expiryStr) return true;
    const expiry = parseInt(expiryStr, 10);
    return Date.now() >= expiry;
  }

  private iniciarTemporizadorExpiracion(): void {
    if (this.timerExpiracion) {
      clearTimeout(this.timerExpiracion);
    }
    const expiryStr = sessionStorage.getItem(EXPIRY_KEY);
    if (!expiryStr) return;

    const tiempoRestante = parseInt(expiryStr, 10) - Date.now();
    if (tiempoRestante <= 0) {
      this.logout();
    } else {
      this.timerExpiracion = setTimeout(() => {
        console.warn('El token ha expirado. Cerrando sesión automáticamente...');
        this.logout();
      }, tiempoRestante);
    }
  }

  private getInitialToken(): string | null {
    if (this.esTokenExpirado()) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(EXPIRY_KEY);
      sessionStorage.removeItem(USER_KEY);
      return null;
    }
    return sessionStorage.getItem(TOKEN_KEY);
  }

  private getInitialUser(): UsuarioActual | null {
    if (this.esTokenExpirado()) return null;
    const u = sessionStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  }
}
