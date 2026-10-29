import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found-container">
      <div class="not-found-card">
        <div class="icon">🔍</div>
        <h1>Página no encontrada</h1>
        <p class="code">Error 404</p>
        <p class="description">
          La ruta a la que intentas acceder no existe en la aplicación AutoAndes.
        </p>
        <a routerLink="/" class="btn-primary">Volver al inicio</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
      padding: 1.5rem;
    }
    .not-found-card {
      background: #ffffff;
      border-radius: 1rem;
      padding: 3rem 2.5rem;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }
    .icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }
    .code {
      font-size: 0.9rem;
      font-weight: 600;
      color: #6b7280;
      background: #f3f4f6;
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      margin-bottom: 1rem;
    }
    .description {
      color: #4b5563;
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
    }
  `]
})
export class NoEncontradoComponent {}
