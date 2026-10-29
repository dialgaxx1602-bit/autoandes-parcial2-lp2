import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdenService } from '../../core/services/orden.service';
import { VehiculoService } from '../../core/services/vehiculo.service';
import { ServicioService } from '../../core/services/servicio.service';
import { Vehiculo, Servicio, ErrorBackend, OrdenRequest } from '../../core/models/autoandes.models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-orden-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="form-card">
        <div class="card-header">
          <h2>Registrar Nueva Orden de Servicio</h2>
          <p class="subtitle">Ingrese los datos del vehículo, kilometraje y los servicios a realizar</p>
        </div>

        @if (mensajeAlerta) {
          <div [class]="tipoAlerta === 'error' ? 'alert-danger' : 'alert-success'">
            {{ mensajeAlerta }}
            <button (click)="mensajeAlerta = ''" class="btn-close-alert">×</button>
          </div>
        }

        <form [formGroup]="ordenForm" (ngSubmit)="registrarOrden()">
          
          <div class="form-section">
            <h3 class="section-title">1. Datos del Vehículo y Kilometraje</h3>
            <div class="form-row">
              <div class="form-group col">
                <label for="vehiculoId">Vehículo (Placa - Cliente)</label>
                <select
                  id="vehiculoId"
                  formControlName="vehiculoId"
                  class="form-control"
                  [class.is-invalid]="ordenForm.get('vehiculoId')?.touched && ordenForm.get('vehiculoId')?.invalid"
                >
                  <option [ngValue]="null">-- Seleccione el Vehículo --</option>
                  @for (v of vehiculos; track v.id) {
                    <option [ngValue]="v.id">
                      {{ v.placa }} · {{ v.marca }} {{ v.modelo }} ({{ v.clienteNombre }})
                    </option>
                  }
                </select>
                @if (ordenForm.get('vehiculoId')?.touched && ordenForm.get('vehiculoId')?.errors?.['required']) {
                  <small class="error-text">Debe seleccionar un vehículo</small>
                }
              </div>

              <div class="form-group col">
                <label for="kilometraje">Kilometraje Actual (km)</label>
                <input
                  id="kilometraje"
                  type="number"
                  formControlName="kilometraje"
                  placeholder="Ej. 46000"
                  class="form-control"
                  [class.is-invalid]="ordenForm.get('kilometraje')?.touched && ordenForm.get('kilometraje')?.invalid"
                />
                @if (ordenForm.get('kilometraje')?.touched && ordenForm.get('kilometraje')?.errors?.['required']) {
                  <small class="error-text">El kilometraje es obligatorio</small>
                } @else if (ordenForm.get('kilometraje')?.touched && ordenForm.get('kilometraje')?.errors?.['min']) {
                  <small class="error-text">El kilometraje debe ser mayor a 0</small>
                }
              </div>
            </div>
          </div>

          
          <div class="form-section">
            <div class="section-header-flex">
              <h3 class="section-title">2. Servicios a Realizar (1 a 10 líneas)</h3>
              <button
                type="button"
                (click)="agregarDetalle()"
                [disabled]="detallesArray.length >= 10"
                class="btn-add-detail"
              >
                + Agregar Servicio
              </button>
            </div>

            <div class="detalles-list" formArrayName="detalles">
              @for (item of detallesArray.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="detalle-row">
                  <div class="col-index">#{{ i + 1 }}</div>

                  <div class="col-servicio">
                    <label>Servicio</label>
                    <select
                      formControlName="servicioId"
                      (change)="onServicioChange(i)"
                      class="form-control"
                      [class.is-invalid]="item.get('servicioId')?.touched && item.get('servicioId')?.invalid"
                    >
                      <option [ngValue]="null">-- Seleccione Servicio --</option>
                      @for (s of serviciosActivos; track s.id) {
                        <option [ngValue]="s.id" [disabled]="esServicioYaSeleccionado(s.id, i)">
                          {{ s.codigo }} - {{ s.nombre }} (S/ {{ s.precio | number:'1.2-2' }})
                        </option>
                      }
                    </select>
                  </div>

                  <div class="col-cantidad">
                    <label>Cant (1-5)</label>
                    <input
                      type="number"
                      formControlName="cantidad"
                      (input)="calcularTotales()"
                      min="1"
                      max="5"
                      class="form-control"
                    />
                  </div>

                  <div class="col-precio">
                    <label>Precio Unit.</label>
                    <div class="readonly-value">
                      S/ {{ obtenerPrecioUnitario(i) | number:'1.2-2' }}
                    </div>
                  </div>

                  <div class="col-subtotal">
                    <label>Subtotal</label>
                    <div class="readonly-value subtotal-highlight">
                      S/ {{ obtenerSubtotal(i) | number:'1.2-2' }}
                    </div>
                  </div>

                  <div class="col-remove">
                    <button
                      type="button"
                      (click)="removerDetalle(i)"
                      [disabled]="detallesArray.length <= 1"
                      class="btn-remove"
                      title="Quitar línea"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              }
            </div>

            
            <div class="total-bar">
              <span class="total-label">Total Estimado de la Orden:</span>
              <span class="total-amount">S/ {{ totalCalculado | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" (click)="cancelar()" class="btn-secondary">
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="ordenForm.invalid || guardando"
              class="btn-primary-large"
            >
              {{ guardando ? 'Registrando en base de datos...' : 'Confirmar y Registrar Orden' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 900px;
      margin: 0 auto;
    }
    .form-card {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .card-header {
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 1rem;
    }
    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }
    .subtitle {
      color: #64748b;
      font-size: 0.88rem;
      margin-top: 0.25rem;
    }
    .form-section {
      margin-bottom: 2rem;
      background: #f8fafc;
      padding: 1.25rem;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
    }
    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1e3a8a;
      margin-top: 0;
      margin-bottom: 1rem;
    }
    .section-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .form-row {
      display: flex;
      gap: 1.25rem;
    }
    .col {
      flex: 1;
    }
    .form-group label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.35rem;
    }
    .form-control {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      font-size: 0.92rem;
      box-sizing: border-box;
      background: white;
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
      margin-top: 0.3rem;
      display: block;
    }
    .btn-add-detail {
      background: #dbeafe;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      padding: 0.45rem 0.9rem;
      border-radius: 0.375rem;
      font-weight: 600;
      font-size: 0.82rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-add-detail:hover:not(:disabled) {
      background: #bfdbfe;
    }
    .btn-add-detail:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .detalles-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .detalle-row {
      display: flex;
      gap: 0.75rem;
      align-items: flex-end;
      background: white;
      padding: 0.85rem;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
    }
    .col-index {
      font-weight: 700;
      color: #94a3b8;
      padding-bottom: 0.7rem;
      font-size: 0.85rem;
    }
    .col-servicio {
      flex: 3;
    }
    .col-cantidad {
      flex: 1;
    }
    .col-precio, .col-subtotal {
      flex: 1.2;
    }
    .col-remove {
      padding-bottom: 0.15rem;
    }
    .detalle-row label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 0.3rem;
    }
    .readonly-value {
      padding: 0.65rem 0.5rem;
      font-size: 0.92rem;
      font-weight: 600;
      color: #334155;
    }
    .subtotal-highlight {
      color: #059669;
    }
    .btn-remove {
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      padding: 0.55rem;
      border-radius: 0.375rem;
      cursor: pointer;
    }
    .btn-remove:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .total-bar {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1rem;
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 2px dashed #cbd5e1;
    }
    .total-label {
      font-size: 1.05rem;
      font-weight: 600;
      color: #475569;
    }
    .total-amount {
      font-size: 1.5rem;
      font-weight: 800;
      color: #059669;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      border: 1px solid #cbd5e1;
      cursor: pointer;
    }
    .btn-primary-large {
      background: #2563eb;
      color: white;
      padding: 0.75rem 1.75rem;
      border-radius: 0.5rem;
      font-weight: 700;
      font-size: 0.95rem;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-primary-large:hover:not(:disabled) {
      background: #1d4ed8;
    }
    .btn-primary-large:disabled {
      background: #94a3b8;
      cursor: not-allowed;
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
  `]
})
export class OrdenRegistroComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ordenService = inject(OrdenService);
  private vehiculoService = inject(VehiculoService);
  private servicioService = inject(ServicioService);
  private router = inject(Router);

  vehiculos: Vehiculo[] = [];
  servicios: Servicio[] = [];
  serviciosActivos: Servicio[] = [];

  guardando = false;
  mensajeAlerta = '';
  tipoAlerta: 'error' | 'success' = 'success';
  totalCalculado = 0;

  ordenForm = this.fb.group({
    vehiculoId: [null as number | null, [Validators.required]],
    kilometraje: [null as number | null, [Validators.required, Validators.min(1)]],
    detalles: this.fb.array([])
  });

  get detallesArray(): FormArray {
    return this.ordenForm.get('detalles') as FormArray;
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.agregarDetalle();
  }

  cargarDatos(): void {
    this.vehiculoService.listar().subscribe({
      next: (data) => this.vehiculos = data,
      error: () => console.warn('Error al cargar lista de vehículos')
    });

    this.servicioService.listar().subscribe({
      next: (data) => {
        this.servicios = data;
        
        this.serviciosActivos = data.filter(s => s.activo === 1);
      },
      error: () => console.warn('Error al cargar catálogo de servicios')
    });
  }

  agregarDetalle(): void {
    if (this.detallesArray.length >= 10) return;

    const detalleGroup = this.fb.group({
      servicioId: [null as number | null, [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(1), Validators.max(5)]]
    });

    this.detallesArray.push(detalleGroup);
    this.calcularTotales();
  }

  removerDetalle(index: number): void {
    if (this.detallesArray.length <= 1) return;
    this.detallesArray.removeAt(index);
    this.calcularTotales();
  }

  onServicioChange(index: number): void {
    this.calcularTotales();
  }

  esServicioYaSeleccionado(servicioId: number | undefined, currentIndex: number): boolean {
    if (!servicioId) return false;
    const values = this.detallesArray.getRawValue();
    return values.some((val, i) => i !== currentIndex && val.servicioId === servicioId);
  }

  obtenerPrecioUnitario(index: number): number {
    const sId = this.detallesArray.at(index).get('servicioId')?.value;
    if (!sId) return 0;
    const s = this.servicios.find(x => x.id === sId);
    return s ? s.precio : 0;
  }

  obtenerSubtotal(index: number): number {
    const cant = this.detallesArray.at(index).get('cantidad')?.value || 0;
    return this.obtenerPrecioUnitario(index) * Number(cant);
  }

  calcularTotales(): void {
    let sum = 0;
    for (let i = 0; i < this.detallesArray.length; i++) {
      sum += this.obtenerSubtotal(i);
    }
    this.totalCalculado = sum;
  }

  registrarOrden(): void {
    if (this.ordenForm.invalid) return;

    this.guardando = true;
    this.mensajeAlerta = '';

    const formVal = this.ordenForm.getRawValue();
    const req: OrdenRequest = {
      vehiculoId: Number(formVal.vehiculoId),
      kilometraje: Number(formVal.kilometraje),
      detalles: formVal.detalles.map((d: any) => ({
        servicioId: Number(d.servicioId),
        cantidad: Number(d.cantidad)
      }))
    };

    this.ordenService.registrar(req).subscribe({
      next: (ordenCreada) => {
        this.guardando = false;
        alert(`¡Orden de Servicio registrada con éxito!\nNúmero: ${ordenCreada.numero}\nTotal: S/ ${ordenCreada.total}`);
        this.router.navigate(['/ordenes']);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        const errBody: ErrorBackend = err.error;
        
        if (errBody?.mensaje) {
          this.mensajeAlerta = errBody.mensaje;
        } else {
          this.mensajeAlerta = 'Error al registrar la orden. Por favor verifique los datos.';
        }
        this.tipoAlerta = 'error';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/ordenes']);
  }
}
