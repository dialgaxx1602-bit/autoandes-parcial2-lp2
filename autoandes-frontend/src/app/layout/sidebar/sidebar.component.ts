import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MENU_ITEMS, MenuItem } from '../../core/config/menu';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="app-sidebar">
      <div class="menu-label">Navegación del Taller</div>
      <nav class="nav-menu">
        @for (item of menuFiltrado(); track item.ruta) {
          <a
            [routerLink]="item.ruta"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.ruta === '/ordenes' }"
            class="nav-link"
          >
            <span class="nav-icon">▸</span>
            <span class="nav-title">{{ item.titulo }}</span>
          </a>
        }
      </nav>
    </aside>
  `,
  styles: [`
    .app-sidebar {
      width: 240px;
      background: #1e293b;
      color: #e2e8f0;
      min-height: calc(100vh - 65px);
      padding: 1.25rem 0.75rem;
      border-right: 1px solid #334155;
    }
    .menu-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
      padding-left: 0.75rem;
    }
    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.7rem 0.85rem;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.92rem;
      font-weight: 500;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
    }
    .nav-link:hover {
      background: #334155;
      color: #ffffff;
    }
    .nav-link.active {
      background: #2563eb;
      color: #ffffff;
      font-weight: 600;
    }
    .nav-icon {
      font-size: 0.8rem;
    }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);

  
  menuFiltrado = computed(() => {
    const permisos = this.authService.permisos();
    return MENU_ITEMS.filter(item => permisos.includes(item.permisoRequerido));
  });
}
