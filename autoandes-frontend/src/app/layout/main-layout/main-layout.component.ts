import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="layout-wrapper">
      <app-header />
      <div class="layout-body">
        <app-sidebar />
        <main class="layout-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f8fafc;
    }
    .layout-body {
      display: flex;
      flex: 1;
    }
    .layout-content {
      flex: 1;
      padding: 2rem;
      background: #f1f5f9;
      overflow-y: auto;
    }
  `]
})
export class MainLayoutComponent {}
