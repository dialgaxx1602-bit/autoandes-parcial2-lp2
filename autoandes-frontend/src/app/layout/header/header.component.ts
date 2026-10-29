import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="app-header">
      <div class="brand">
        <span class="brand-badge">AutoAndes</span>
        <span class="brand-tagline">Taller Mecánico · Gestión Empresarial</span>
      </div>
      <div class="user-profile">
        @if (authService.usuario(); as user) {
          <div class="user-info">
            <span class="user-name">{{ user.nombreCompleto }}</span>
            <span class="user-role">
              {{ user.roles.join(', ') }} · &#64;{{ user.username }}
            </span>
          </div>
          <button (click)="logout()" class="btn-logout" title="Cerrar sesión">
            Cerrar sesión
          </button>
        }
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      background: #0f172a;
      color: #ffffff;
      padding: 0.85rem 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #2563eb;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .brand-badge {
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .brand-tagline {
      font-size: 0.85rem;
      color: #94a3b8;
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .user-name {
      font-weight: 600;
      font-size: 0.95rem;
      color: #f8fafc;
    }
    .user-role {
      font-size: 0.75rem;
      color: #38bdf8;
      font-weight: 500;
    }
    .btn-logout {
      background: #1e293b;
      color: #f1f5f9;
      border: 1px solid #334155;
      padding: 0.45rem 0.95rem;
      border-radius: 0.375rem;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-logout:hover {
      background: #ef4444;
      border-color: #dc2626;
      color: #ffffff;
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
