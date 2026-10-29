import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="header">
          <div class="logo">🔧</div>
          <h1>AutoAndes</h1>
          <p class="subtitle">Sistema de Órdenes de Servicio del Taller</p>
        </div>

        @if (errorMensaje) {
          <div class="alert-error">
            {{ errorMensaje }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              placeholder="admin, asesor, jefe o inactivo"
              class="form-control"
              [class.is-invalid]="loginForm.get('username')?.touched && loginForm.get('username')?.invalid"
            />
            @if (loginForm.get('username')?.touched && loginForm.get('username')?.errors?.['required']) {
              <small class="error-text">El usuario es requerido</small>
            }
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Auto2026*"
              class="form-control"
              [class.is-invalid]="loginForm.get('password')?.touched && loginForm.get('password')?.invalid"
            />
            @if (loginForm.get('password')?.touched && loginForm.get('password')?.errors?.['required']) {
              <small class="error-text">La contraseña es requerida</small>
            }
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || cargando"
            class="btn-submit"
          >
            @if (cargando) {
              <span>Iniciando sesión...</span>
            } @else {
              <span>Ingresar al Sistema</span>
            }
          </button>
        </form>

        <div class="quick-credentials">
          <p class="cred-title">Cuentas de prueba (Contraseña: <code>Auto2026*</code>):</p>
          <div class="cred-grid">
            <button type="button" (click)="rellenar('asesor')">Asesor (Mostrador)</button>
            <button type="button" (click)="rellenar('jefe')">Jefe de Taller</button>
            <button type="button" (click)="rellenar('admin')">Administrador</button>
            <button type="button" (click)="rellenar('inactivo')">Inactivo (Test 401)</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 1.5rem;
    }
    .login-card {
      background: #ffffff;
      border-radius: 1rem;
      padding: 2.5rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .logo {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    h1 {
      font-size: 1.85rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.25rem;
    }
    .subtitle {
      font-size: 0.88rem;
      color: #64748b;
    }
    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.88rem;
      font-weight: 500;
      margin-bottom: 1.25rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    label {
      display: block;
      font-size: 0.88rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.4rem;
    }
    .form-control {
      width: 100%;
      padding: 0.7rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      transition: all 0.2s;
      box-sizing: border-box;
    }
    .form-control:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
    .form-control.is-invalid {
      border-color: #ef4444;
    }
    .error-text {
      color: #dc2626;
      font-size: 0.78rem;
      margin-top: 0.35rem;
      display: block;
    }
    .btn-submit {
      width: 100%;
      background: #2563eb;
      color: white;
      padding: 0.85rem;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 1rem;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 0.5rem;
    }
    .btn-submit:hover:not(:disabled) {
      background: #1d4ed8;
    }
    .btn-submit:disabled {
      background: #94a3b8;
      cursor: not-allowed;
    }
    .quick-credentials {
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px solid #e2e8f0;
    }
    .cred-title {
      font-size: 0.78rem;
      color: #64748b;
      margin-bottom: 0.65rem;
      text-align: center;
    }
    .cred-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    .cred-grid button {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #334155;
      padding: 0.45rem;
      border-radius: 0.375rem;
      font-size: 0.76rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cred-grid button:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  cargando = false;
  errorMensaje = '';

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  rellenar(usuario: string): void {
    this.loginForm.patchValue({
      username: usuario,
      password: 'Auto2026*'
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.cargando = true;
    this.errorMensaje = '';

    const { username, password } = this.loginForm.getRawValue();

    this.authService.login({ username: username!, password: password! }).subscribe({
      next: () => {
        this.cargando = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/ordenes';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        if (err.error && err.error.mensaje) {
          this.errorMensaje = err.error.mensaje;
        } else if (err.status === 401) {
          this.errorMensaje = 'Credenciales inválidas o cuenta inactiva';
        } else {
          this.errorMensaje = 'Error al conectar con el servidor. Inténtelo más tarde.';
        }
      }
    });
  }
}
