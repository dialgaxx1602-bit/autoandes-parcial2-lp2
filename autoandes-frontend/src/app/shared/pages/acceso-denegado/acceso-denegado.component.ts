import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="denied-container">
      <div class="denied-card">
        <div class="denied-icon">🔒</div>
        <h1>Acceso Denegado</h1>
        <p class="code">Error 403 · Forbidden</p>
        <p class="description">
          No cuentas con los permisos requeridos para acceder a este recurso del sistema.
          Tu sesión permanece activa de manera segura.
        </p>
        <div class="actions">
          <a routerLink="/" class="btn-primary">Ir al Inicio</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .denied-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
      padding: 1.5rem;
    }
    .denied-card {
      background: #ffffff;
      border-radius: 1rem;
      padding: 3rem 2.5rem;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border: 1px solid #fee2e2;
    }
    .denied-icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #991b1b;
      margin-bottom: 0.5rem;
    }
    .code {
      font-size: 0.9rem;
      font-weight: 600;
      color: #dc2626;
      background: #fef2f2;
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      margin-bottom: 1rem;
    }
    .description {
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .btn-primary {
      display: inline-block;
      background: #1e3a8a;
      color: white;
      padding: 0.75rem 1.75rem;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 600;
      transition: background 0.2s;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }
  `]
})
export class AccesoDenegadoComponent {}
