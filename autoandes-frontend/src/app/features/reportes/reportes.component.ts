import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdenService } from '../../core/services/orden.service';
import { ReporteIngresoServicio } from '../../core/models/autoandes.models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Reporte de Ingresos por Servicio</h2>
          <p class="subtitle">Consulta JPQL agregada (GROUP BY) ordenada por importe descendente, excluyendo órdenes anuladas</p>
        </div>
      </div>

      
      <div class="filters-card">
        <div class="filter-group">
          <label>Fecha Desde:</label>
          <input
            type="datetime-local"
            [(ngModel)]="filtroDesde"
            class="form-control"
          />
        </div>

        <div class="filter-group">
          <label>Fecha Hasta:</label>
          <input
            type="datetime-local"
            [(ngModel)]="filtroHasta"
            class="form-control"
          />
        </div>

        <div class="filter-actions">
          <button (click)="cargarReporte()" class="btn-search">Filtrar Reporte</button>
          <button (click)="limpiar()" class="btn-reset">Todos los Tiempos</button>
        </div>
      </div>

      
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-title">Ingresos Totales (excluye anuladas)</div>
          <div class="metric-value">S/ {{ totalIngresos | number:'1.2-2' }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Total de Servicios Prestados</div>
          <div class="metric-value">{{ totalServiciosPrestados }} unidades</div>
        </div>
      </div>

      
      <div class="card table-card">
        @if (cargando) {
          <div class="loading-state">
            <p>Cargando datos del reporte agregado...</p>
          </div>
        } @else if (reporteData.length === 0) {
          <div class="empty-state">
            <p>No hay ingresos registrados en el periodo seleccionado.</p>
          </div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Código</th>
                <th>Descripción del Servicio</th>
                <th>Cantidad Total Prestada</th>
                <th class="money-col">Importe Total Generado (S/)</th>
              </tr>
            </thead>
            <tbody>
              @for (item of reporteData; track item.codigo; let i = $index) {
                <tr>
                  <td>
                    <span class="rank-badge" [class.rank-top]="i === 0">#{{ i + 1 }}</span>
                  </td>
                  <td class="code-cell">{{ item.codigo }}</td>
                  <td class="name-cell"><strong>{{ item.servicio }}</strong></td>
                  <td class="qty-cell">{{ item.cantidadTotal }} servicios</td>
                  <td class="money-cell">S/ {{ item.importeTotal | number:'1.2-2' }}</td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr>
                <th colspan="3" style="text-align: right;">Total Acumulado:</th>
                <th class="qty-cell">{{ totalServiciosPrestados }} servicios</th>
                <th class="money-cell" style="font-size: 1.1rem; color: #059669;">S/ {{ totalIngresos | number:'1.2-2' }}</th>
              </tr>
            </tfoot>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1100px;
      margin: 0 auto;
    }
    .page-header {
      margin-bottom: 1.5rem;
    }
    h2 {
      font-size: 1.6rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .subtitle {
      color: #64748b;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }
    .filters-card {
      display: flex;
      gap: 1rem;
      background: white;
      padding: 1.25rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      margin-bottom: 1.5rem;
      align-items: flex-end;
    }
    .filter-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .filter-group label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
    }
    .form-control {
      width: 100%;
      padding: 0.6rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      font-size: 0.92rem;
      box-sizing: border-box;
    }
    .filter-actions {
      display: flex;
      gap: 0.5rem;
    }
    .btn-search {
      background: #2563eb;
      color: white;
      border: none;
      padding: 0.6rem 1.15rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-reset {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      padding: 0.6rem 1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .metric-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
    }
    .metric-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 0.5rem;
    }
    .metric-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
    }
    .table-card {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .data-table th {
      background: #f8fafc;
      padding: 0.85rem 1rem;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
    }
    .data-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.9rem;
      color: #334155;
    }
    .rank-badge {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 0.25rem;
      font-weight: 700;
      font-size: 0.8rem;
      background: #f1f5f9;
      color: #64748b;
    }
    .rank-top {
      background: #fef3c7;
      color: #b45309;
    }
    .code-cell {
      font-family: monospace;
      font-weight: 700;
      color: #1e3a8a;
    }
    .money-col, .money-cell {
      text-align: right;
    }
    .money-cell {
      font-weight: 700;
    }
    .loading-state, .empty-state {
      padding: 3rem;
      text-align: center;
      color: #64748b;
    }
  `]
})
export class ReportesComponent implements OnInit {
  private ordenService = inject(OrdenService);

  reporteData: ReporteIngresoServicio[] = [];
  cargando = false;

  filtroDesde = '';
  filtroHasta = '';

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.cargando = true;
    const desde = this.filtroDesde ? `${this.filtroDesde}:00` : undefined;
    const hasta = this.filtroHasta ? `${this.filtroHasta}:00` : undefined;

    this.ordenService.reporteIngresosPorServicio(desde, hasta).subscribe({
      next: (data) => {
        this.reporteData = data;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        console.error('Error al cargar reporte:', err);
      }
    });
  }

  limpiar(): void {
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.cargarReporte();
  }

  get totalIngresos(): number {
    return this.reporteData.reduce((acc, curr) => acc + (Number(curr.importeTotal) || 0), 0);
  }

  get totalServiciosPrestados(): number {
    return this.reporteData.reduce((acc, curr) => acc + (Number(curr.cantidadTotal) || 0), 0);
  }
}
