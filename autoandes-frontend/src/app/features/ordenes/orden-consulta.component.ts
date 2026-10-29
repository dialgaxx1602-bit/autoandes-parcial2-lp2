import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrdenService } from '../../core/services/orden.service';
import { AuthService } from '../../core/auth/auth.service';
import { OrdenResponse, ErrorBackend } from '../../core/models/autoandes.models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-orden-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Órdenes de Servicio</h2>
          <p class="subtitle">Consulta, seguimiento de estado, detalle y anulación de órdenes</p>
        </div>
        @if (authService.tienePermiso('ORDEN_REGISTRAR')) {
          <a routerLink="/ordenes/nueva" class="btn-primary">
            + Nueva Orden
          </a>
        }
      </div>

      
      @if (mensajeAlerta) {
        <div [class]="tipoAlerta === 'error' ? 'alert-danger' : 'alert-success'">
          {{ mensajeAlerta }}
          <button (click)="mensajeAlerta = ''" class="btn-close-alert">×</button>
        </div>
      }

      
      <div class="filters-card">
        <div class="filter-group">
          <label>Placa:</label>
          <input
            type="text"
            [(ngModel)]="filtroPlaca"
            placeholder="Ej. AAA-111"
            class="form-control"
          />
        </div>

        <div class="filter-group">
          <label>Estado:</label>
          <select [(ngModel)]="filtroEstado" class="form-control">
            <option value="">-- Todos los estados --</option>
            <option value="REGISTRADA">REGISTRADA</option>
            <option value="ANULADA">ANULADA</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Desde:</label>
          <input
            type="datetime-local"
            [(ngModel)]="filtroDesde"
            class="form-control"
          />
        </div>

        <div class="filter-group">
          <label>Hasta:</label>
          <input
            type="datetime-local"
            [(ngModel)]="filtroHasta"
            class="form-control"
          />
        </div>

        <div class="filter-actions">
          <button (click)="filtrar()" class="btn-search">Buscar</button>
          <button (click)="limpiarFiltros()" class="btn-reset">Limpiar</button>
        </div>
      </div>

      
      <div class="card table-card">
        @if (cargando) {
          <div class="loading-state">
            <p>Cargando órdenes de servicio...</p>
          </div>
        } @else if (ordenes.length === 0) {
          <div class="empty-state">
            <p>No se encontraron órdenes con los criterios especificados.</p>
          </div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha y Hora</th>
                <th>Vehículo</th>
                <th>Cliente</th>
                <th>Kilometraje</th>
                <th>Total (S/)</th>
                <th>Estado</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (o of ordenes; track o.id) {
                <tr [class.anulada-row]="o.estado === 'ANULADA'">
                  <td class="numero-cell">{{ o.numero }}</td>
                  <td>{{ o.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td><span class="placa-badge">{{ o.vehiculoPlaca }}</span></td>
                  <td>{{ o.clienteNombre }}</td>
                  <td>{{ o.kilometraje | number }} km</td>
                  <td class="total-cell">S/ {{ o.total | number:'1.2-2' }}</td>
                  <td>
                    <span [class]="o.estado === 'REGISTRADA' ? 'badge-registrada' : 'badge-anulada'">
                      {{ o.estado }}
                    </span>
                  </td>
                  <td class="actions-col">
                    <button (click)="verDetalle(o)" class="btn-action view" title="Ver Detalle">
                      Ver Detalle
                    </button>
                    @if (authService.tienePermiso('ORDEN_ANULAR') && o.estado === 'REGISTRADA') {
                      <button (click)="abrirModalAnular(o)" class="btn-action cancel" title="Anular Orden">
                        Anular
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      
      @if (ordenSeleccionadaDetalle) {
        <div class="modal-backdrop">
          <div class="modal-card modal-lg">
            <div class="modal-header">
              <h3>Detalle de Orden: {{ ordenSeleccionadaDetalle.numero }}</h3>
              <button (click)="ordenSeleccionadaDetalle = null" class="btn-close">×</button>
            </div>

            <div class="detalle-info-grid">
              <div><strong>Fecha:</strong> {{ ordenSeleccionadaDetalle.fecha | date:'dd/MM/yyyy HH:mm:ss' }}</div>
              <div><strong>Estado:</strong> {{ ordenSeleccionadaDetalle.estado }}</div>
              <div><strong>Vehículo:</strong> {{ ordenSeleccionadaDetalle.vehiculoPlaca }}</div>
              <div><strong>Cliente:</strong> {{ ordenSeleccionadaDetalle.clienteNombre }}</div>
              <div><strong>Kilometraje:</strong> {{ ordenSeleccionadaDetalle.kilometraje | number }} km</div>
              <div><strong>Registrado por:</strong> {{ ordenSeleccionadaDetalle.usuarioRegistro }}</div>
              @if (ordenSeleccionadaDetalle.motivoAnulacion) {
                <div class="full-width alert-motivo">
                  <strong>Motivo de Anulación:</strong> {{ ordenSeleccionadaDetalle.motivoAnulacion }}
                </div>
              }
            </div>

            <h4 class="items-title">Servicios Incluidos</h4>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Servicio</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                @for (d of ordenSeleccionadaDetalle.detalles; track d.id) {
                  <tr>
                    <td class="code-cell">{{ d.servicioCodigo }}</td>
                    <td>{{ d.servicioNombre }}</td>
                    <td>{{ d.cantidad }}</td>
                    <td>S/ {{ d.precioUnitario | number:'1.2-2' }}</td>
                    <td class="subtotal-cell">S/ {{ d.subtotal | number:'1.2-2' }}</td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="4" style="text-align: right;">Total General:</th>
                  <th class="total-cell">S/ {{ ordenSeleccionadaDetalle.total | number:'1.2-2' }}</th>
                </tr>
              </tfoot>
            </table>

            <div class="modal-footer">
              <button (click)="ordenSeleccionadaDetalle = null" class="btn-secondary">Cerrar</button>
            </div>
          </div>
        </div>
      }

      
      @if (ordenAAnular) {
        <div class="modal-backdrop">
          <div class="modal-card">
            <div class="modal-header">
              <h3 style="color: #dc2626;">Anular Orden: {{ ordenAAnular.numero }}</h3>
              <button (click)="ordenAAnular = null" class="btn-close">×</button>
            </div>

            <p class="modal-desc">
              Esta acción marcará la orden como <strong>ANULADA</strong>. Conforme a las reglas de negocio (RN-05), solo se pueden anular órdenes registradas en el día de hoy y el motivo debe tener entre 10 y 200 caracteres.
            </p>

            <div class="form-group">
              <label for="motivoAnulacion">Motivo de la anulación:</label>
              <textarea
                id="motivoAnulacion"
                [(ngModel)]="motivoAnulacionTexto"
                rows="4"
                placeholder="Especifique detalladamente el motivo de la anulación..."
                class="form-control"
              ></textarea>
              <small class="char-count">Caracteres: {{ motivoAnulacionTexto.length }} / 200 (mínimo 10)</small>
            </div>

            <div class="modal-footer">
              <button (click)="ordenAAnular = null" class="btn-secondary">Cancelar</button>
              <button
                (click)="confirmarAnulacion()"
                [disabled]="motivoAnulacionTexto.trim().length < 10 || motivoAnulacionTexto.trim().length > 200 || anulando"
                class="btn-danger"
              >
                {{ anulando ? 'Anulando...' : 'Confirmar Anulación' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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
      flex-wrap: wrap;
    }
    .filter-group {
      flex: 1;
      min-width: 160px;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .filter-group label {
      font-size: 0.78rem;
      font-weight: 600;
      color: #475569;
    }
    .form-control {
      width: 100%;
      padding: 0.55rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.375rem;
      font-size: 0.88rem;
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
      padding: 0.55rem 1rem;
      border-radius: 0.375rem;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
    }
    .btn-reset {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      padding: 0.55rem 0.85rem;
      border-radius: 0.375rem;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
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
      font-size: 0.88rem;
      color: #334155;
    }
    .anulada-row {
      background: #fef2f2;
      opacity: 0.85;
    }
    .numero-cell {
      font-family: monospace;
      font-weight: 700;
      color: #1e3a8a;
    }
    .placa-badge {
      font-family: monospace;
      font-weight: 700;
      background: #eff6ff;
      color: #1d4ed8;
      padding: 0.2rem 0.5rem;
      border-radius: 0.25rem;
    }
    .total-cell {
      font-weight: 700;
      color: #0f172a;
    }
    .subtotal-cell {
      font-weight: 600;
      color: #059669;
    }
    .badge-registrada {
      background: #dcfce7;
      color: #15803d;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .badge-anulada {
      background: #fee2e2;
      color: #b91c1c;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .actions-col {
      text-align: right;
    }
    .btn-action {
      padding: 0.35rem 0.65rem;
      border-radius: 0.375rem;
      font-size: 0.78rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      margin-left: 0.35rem;
      transition: all 0.2s;
    }
    .btn-action.view {
      background: #e0f2fe;
      color: #0369a1;
    }
    .btn-action.view:hover { background: #bae6fd; }
    .btn-action.cancel {
      background: #fee2e2;
      color: #b91c1c;
    }
    .btn-action.cancel:hover { background: #fecaca; }
    .btn-primary {
      background: #2563eb;
      color: white;
      padding: 0.65rem 1.25rem;
      border-radius: 0.5rem;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      padding: 1rem;
    }
    .modal-card {
      background: white;
      border-radius: 0.75rem;
      width: 100%;
      max-width: 540px;
      padding: 1.75rem;
    }
    .modal-card.modal-lg {
      max-width: 750px;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .modal-header h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #64748b;
    }
    .detalle-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      background: #f8fafc;
      padding: 1rem;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
      font-size: 0.88rem;
      margin-bottom: 1.25rem;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .alert-motivo {
      background: #fef2f2;
      color: #b91c1c;
      padding: 0.5rem;
      border-radius: 0.375rem;
    }
    .items-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1e3a8a;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
      padding: 0.65rem 1.25rem;
      border-radius: 0.5rem;
      font-weight: 600;
      border: 1px solid #cbd5e1;
      cursor: pointer;
    }
    .btn-danger {
      background: #dc2626;
      color: white;
      padding: 0.65rem 1.25rem;
      border-radius: 0.5rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
    }
    .btn-danger:disabled {
      background: #fca5a5;
      cursor: not-allowed;
    }
    .char-count {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.3rem;
      display: block;
    }
    .alert-danger {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      padding: 0.85rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }
    .alert-success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
      padding: 0.85rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }
    .btn-close-alert {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: inherit;
    }
    .loading-state, .empty-state {
      padding: 3rem;
      text-align: center;
      color: #64748b;
    }
  `]
})
export class OrdenConsultaComponent implements OnInit {
  private ordenService = inject(OrdenService);
  authService = inject(AuthService);

  ordenes: OrdenResponse[] = [];
  cargando = false;

  filtroPlaca = '';
  filtroEstado = '';
  filtroDesde = '';
  filtroHasta = '';

  mensajeAlerta = '';
  tipoAlerta: 'error' | 'success' = 'success';

  ordenSeleccionadaDetalle: OrdenResponse | null = null;
  ordenAAnular: OrdenResponse | null = null;
  motivoAnulacionTexto = '';
  anulando = false;

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    this.cargando = true;
    const filtros = {
      placa: this.filtroPlaca || undefined,
      estado: this.filtroEstado || undefined,
      desde: this.filtroDesde ? `${this.filtroDesde}:00` : undefined,
      hasta: this.filtroHasta ? `${this.filtroHasta}:00` : undefined
    };

    this.ordenService.listar(filtros).subscribe({
      next: (data) => {
        this.ordenes = data;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.mostrarMensaje(err.error?.mensaje || 'Error al cargar órdenes de servicio', 'error');
      }
    });
  }

  filtrar(): void {
    this.cargarOrdenes();
  }

  limpiarFiltros(): void {
    this.filtroPlaca = '';
    this.filtroEstado = '';
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.cargarOrdenes();
  }

  verDetalle(o: OrdenResponse): void {
    this.ordenSeleccionadaDetalle = o;
  }

  abrirModalAnular(o: OrdenResponse): void {
    this.ordenAAnular = o;
    this.motivoAnulacionTexto = '';
  }

  confirmarAnulacion(): void {
    if (!this.ordenAAnular || !this.ordenAAnular.id) return;

    this.anulando = true;
    this.ordenService.anular(this.ordenAAnular.id, { motivo: this.motivoAnulacionTexto.trim() }).subscribe({
      next: (ordenActualizada) => {
        this.anulando = false;
        this.ordenAAnular = null;
        this.mostrarMensaje(`Orden ${ordenActualizada.numero} anulada exitosamente.`, 'success');
        this.cargarOrdenes();
      },
      error: (err: HttpErrorResponse) => {
        this.anulando = false;
        
        this.mostrarMensaje(err.error?.mensaje || 'Error al anular la orden', 'error');
      }
    });
  }

  private mostrarMensaje(texto: string, tipo: 'error' | 'success'): void {
    this.mensajeAlerta = texto;
    this.tipoAlerta = tipo;
  }
}
