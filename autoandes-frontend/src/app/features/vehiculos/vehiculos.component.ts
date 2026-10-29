import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehiculoService } from '../../core/services/vehiculo.service';
import { ClienteService } from '../../core/services/cliente.service';
import { AuthService } from '../../core/auth/auth.service';
import { Vehiculo, Cliente, ErrorBackend } from '../../core/models/autoandes.models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Gestión de Vehículos</h2>
          <p class="subtitle">Registro de unidades, datos del cliente y validación de placas</p>
        </div>
        @if (authService.tienePermiso('VEHICULO_ESCRIBIR')) {
          <button (click)="abrirModalNuevo()" class="btn-primary">
            + Nuevo Vehículo
          </button>
        }
      </div>

      
      @if (mensajeAlerta) {
        <div [class]="tipoAlerta === 'error' ? 'alert-danger' : 'alert-success'">
          {{ mensajeAlerta }}
          <button (click)="mensajeAlerta = ''" class="btn-close-alert">×</button>
        </div>
      }

      
      <div class="filter-bar">
        <div class="filter-item">
          <label>Filtrar por Cliente:</label>
          <select [(ngModel)]="clienteFiltroId" (change)="cargarVehiculos()" class="form-control">
            <option [ngValue]="null">-- Todos los Clientes --</option>
            @for (c of clientes; track c.id) {
              <option [ngValue]="c.id">{{ c.nombres }} ({{ c.documento }})</option>
            }
          </select>
        </div>
        <div class="filter-item search-input">
          <label>Buscar por Placa o Modelo:</label>
          <input
            type="text"
            [(ngModel)]="terminoBusqueda"
            placeholder="Ej. AAA-111, Corolla..."
            class="form-control"
          />
        </div>
      </div>

      
      <div class="card table-card">
        @if (cargando) {
          <div class="loading-state">
            <p>Cargando vehículos...</p>
          </div>
        } @else if (vehiculosFiltrados.length === 0) {
          <div class="empty-state">
            <p>No se encontraron vehículos registrados.</p>
          </div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Año</th>
                <th>Cliente Propietario</th>
                @if (authService.tienePermiso('VEHICULO_ESCRIBIR')) {
                  <th class="actions-col">Acciones</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (v of vehiculosFiltrados; track v.id) {
                <tr>
                  <td class="placa-badge">{{ v.placa }}</td>
                  <td><strong>{{ v.marca }}</strong></td>
                  <td>{{ v.modelo }}</td>
                  <td>{{ v.anio }}</td>
                  <td class="client-name">{{ v.clienteNombre }}</td>
                  @if (authService.tienePermiso('VEHICULO_ESCRIBIR')) {
                    <td class="actions-col">
                      <button (click)="abrirModalEditar(v)" class="btn-action edit" title="Editar">
                        Editar
                      </button>
                      <button (click)="eliminar(v)" class="btn-action delete" title="Eliminar">
                        Eliminar
                      </button>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      
      @if (mostrarModal) {
        <div class="modal-backdrop">
          <div class="modal-card">
            <div class="modal-header">
              <h3>{{ modoEdicion ? 'Editar Vehículo: ' + vehiculoSeleccionado?.placa : 'Registrar Nuevo Vehículo' }}</h3>
              <button (click)="cerrarModal()" class="btn-close">×</button>
            </div>

            <form [formGroup]="vehiculoForm" (ngSubmit)="guardarVehiculo()">
              <div class="form-group">
                <label for="placa">Placa (Patrón ABC-123)</label>
                <input
                  id="placa"
                  type="text"
                  formControlName="placa"
                  placeholder="AAA-111"
                  class="form-control"
                  [class.is-invalid]="erroresBackend['placa'] || (vehiculoForm.get('placa')?.touched && vehiculoForm.get('placa')?.invalid)"
                />
                @if (erroresBackend['placa']) {
                  <small class="error-text">{{ erroresBackend['placa'] }}</small>
                } @else if (vehiculoForm.get('placa')?.touched && vehiculoForm.get('placa')?.errors?.['required']) {
                  <small class="error-text">La placa es obligatoria</small>
                } @else if (vehiculoForm.get('placa')?.touched && vehiculoForm.get('placa')?.errors?.['pattern']) {
                  <small class="error-text">La placa debe tener el formato ABC-123</small>
                }
              </div>

              <div class="form-row">
                <div class="form-group col">
                  <label for="marca">Marca</label>
                  <input
                    id="marca"
                    type="text"
                    formControlName="marca"
                    placeholder="Toyota"
                    class="form-control"
                    [class.is-invalid]="erroresBackend['marca'] || (vehiculoForm.get('marca')?.touched && vehiculoForm.get('marca')?.invalid)"
                  />
                  @if (erroresBackend['marca']) {
                    <small class="error-text">{{ erroresBackend['marca'] }}</small>
                  }
                </div>

                <div class="form-group col">
                  <label for="modelo">Modelo</label>
                  <input
                    id="modelo"
                    type="text"
                    formControlName="modelo"
                    placeholder="Corolla"
                    class="form-control"
                    [class.is-invalid]="erroresBackend['modelo'] || (vehiculoForm.get('modelo')?.touched && vehiculoForm.get('modelo')?.invalid)"
                  />
                  @if (erroresBackend['modelo']) {
                    <small class="error-text">{{ erroresBackend['modelo'] }}</small>
                  }
                </div>
              </div>

              <div class="form-row">
                <div class="form-group col">
                  <label for="anio">Año de Fabricación (1990 a 2027)</label>
                  <input
                    id="anio"
                    type="number"
                    formControlName="anio"
                    placeholder="2022"
                    class="form-control"
                    [class.is-invalid]="erroresBackend['anio'] || (vehiculoForm.get('anio')?.touched && vehiculoForm.get('anio')?.invalid)"
                  />
                  @if (erroresBackend['anio']) {
                    <small class="error-text">{{ erroresBackend['anio'] }}</small>
                  } @else if (vehiculoForm.get('anio')?.touched && (vehiculoForm.get('anio')?.errors?.['min'] || vehiculoForm.get('anio')?.errors?.['max'])) {
                    <small class="error-text">El año debe estar entre 1990 y 2027</small>
                  }
                </div>

                <div class="form-group col">
                  <label for="clienteId">Cliente Propietario</label>
                  <select
                    id="clienteId"
                    formControlName="clienteId"
                    class="form-control"
                    [class.is-invalid]="erroresBackend['clienteId'] || (vehiculoForm.get('clienteId')?.touched && vehiculoForm.get('clienteId')?.invalid)"
                  >
                    <option [ngValue]="null">-- Seleccione Cliente --</option>
                    @for (c of clientes; track c.id) {
                      <option [ngValue]="c.id">{{ c.nombres }} (DNI: {{ c.documento }})</option>
                    }
                  </select>
                  @if (erroresBackend['clienteId']) {
                    <small class="error-text">{{ erroresBackend['clienteId'] }}</small>
                  } @else if (vehiculoForm.get('clienteId')?.touched && vehiculoForm.get('clienteId')?.errors?.['required']) {
                    <small class="error-text">El cliente es obligatorio</small>
                  }
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" (click)="cerrarModal()" class="btn-secondary">Cancelar</button>
                <button type="submit" [disabled]="vehiculoForm.invalid || guardando" class="btn-primary">
                  {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Guardar') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1100px;
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
    .filter-bar {
      display: flex;
      gap: 1.25rem;
      margin-bottom: 1.25rem;
      background: white;
      padding: 1rem 1.25rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
    }
    .filter-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .filter-item label {
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
    .table-card {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
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
    .placa-badge {
      font-family: monospace;
      font-weight: 800;
      background: #eff6ff;
      color: #1d4ed8;
      padding: 0.25rem 0.65rem;
      border-radius: 0.375rem;
      border: 1px solid #bfdbfe;
      display: inline-block;
    }
    .client-name {
      color: #0f172a;
      font-weight: 500;
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
    .btn-action.edit {
      background: #e0f2fe;
      color: #0369a1;
    }
    .btn-action.edit:hover { background: #bae6fd; }
    .btn-action.delete {
      background: #fee2e2;
      color: #b91c1c;
    }
    .btn-action.delete:hover { background: #fecaca; }
    .btn-primary {
      background: #2563eb;
      color: white;
      padding: 0.65rem 1.25rem;
      border-radius: 0.5rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background: #1d4ed8; }
    .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
      padding: 0.65rem 1.25rem;
      border-radius: 0.5rem;
      font-weight: 600;
      border: 1px solid #cbd5e1;
      cursor: pointer;
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
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
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
      color: #0f172a;
      margin: 0;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #64748b;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .col {
      flex: 1;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    .loading-state, .empty-state {
      padding: 3rem;
      text-align: center;
      color: #64748b;
    }
  `]
})
export class VehiculosComponent implements OnInit {
  private vehiculoService = inject(VehiculoService);
  private clienteService = inject(ClienteService);
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  vehiculos: Vehiculo[] = [];
  clientes: Cliente[] = [];
  cargando = false;
  guardando = false;

  clienteFiltroId: number | null = null;
  terminoBusqueda = '';

  mensajeAlerta = '';
  tipoAlerta: 'error' | 'success' = 'success';
  erroresBackend: { [campo: string]: string } = {};

  mostrarModal = false;
  modoEdicion = false;
  vehiculoSeleccionado: Vehiculo | null = null;

  vehiculoForm = this.fb.group({
    placa: ['', [Validators.required, Validators.pattern('^[A-Z]{3}-\\d{3}$')]],
    marca: ['', [Validators.required]],
    modelo: ['', [Validators.required]],
    anio: [2022, [Validators.required, Validators.min(1990), Validators.max(2027)]],
    clienteId: [null as number | null, [Validators.required]]
  });

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarVehiculos();
  }

  get vehiculosFiltrados(): Vehiculo[] {
    if (!this.terminoBusqueda.trim()) return this.vehiculos;
    const t = this.terminoBusqueda.toLowerCase();
    return this.vehiculos.filter(v =>
      v.placa.toLowerCase().includes(t) ||
      v.marca.toLowerCase().includes(t) ||
      v.modelo.toLowerCase().includes(t) ||
      (v.clienteNombre && v.clienteNombre.toLowerCase().includes(t))
    );
  }

  cargarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (data) => this.clientes = data,
      error: () => console.warn('Error al cargar lista de clientes')
    });
  }

  cargarVehiculos(): void {
    this.cargando = true;
    this.vehiculoService.listar(this.clienteFiltroId || undefined).subscribe({
      next: (data) => {
        this.vehiculos = data;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.mostrarMensaje(err.error?.mensaje || 'Error al cargar vehículos', 'error');
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.vehiculoSeleccionado = null;
    this.erroresBackend = {};
    this.vehiculoForm.reset({
      placa: '',
      marca: '',
      modelo: '',
      anio: 2022,
      clienteId: null
    });
    this.mostrarModal = true;
  }

  abrirModalEditar(v: Vehiculo): void {
    this.modoEdicion = true;
    this.vehiculoSeleccionado = v;
    this.erroresBackend = {};
    this.vehiculoForm.patchValue({
      placa: v.placa,
      marca: v.marca,
      modelo: v.modelo,
      anio: v.anio,
      clienteId: v.clienteId
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.erroresBackend = {};
  }

  guardarVehiculo(): void {
    if (this.vehiculoForm.invalid) return;

    this.guardando = true;
    this.erroresBackend = {};

    const formVal = this.vehiculoForm.getRawValue();
    const req: Vehiculo = {
      placa: formVal.placa!.toUpperCase(),
      marca: formVal.marca!,
      modelo: formVal.modelo!,
      anio: Number(formVal.anio),
      clienteId: Number(formVal.clienteId)
    };

    if (this.modoEdicion && this.vehiculoSeleccionado?.id) {
      this.vehiculoService.actualizar(this.vehiculoSeleccionado.id, req).subscribe({
        next: (actualizado) => {
          this.guardando = false;
          this.cerrarModal();
          this.mostrarMensaje(`Vehículo con placa ${actualizado.placa} actualizado exitosamente.`, 'success');
          this.cargarVehiculos();
        },
        error: (err: HttpErrorResponse) => this.manejarErrorBackend(err)
      });
    } else {
      this.vehiculoService.crear(req).subscribe({
        next: (creado) => {
          this.guardando = false;
          this.cerrarModal();
          this.mostrarMensaje(`Vehículo con placa ${creado.placa} registrado exitosamente.`, 'success');
          this.cargarVehiculos();
        },
        error: (err: HttpErrorResponse) => this.manejarErrorBackend(err)
      });
    }
  }

  eliminar(v: Vehiculo): void {
    if (!v.id) return;
    if (!confirm(`¿Está seguro de eliminar el vehículo ${v.placa}? Si tiene órdenes registradas el backend responderá 409.`)) return;

    this.vehiculoService.eliminar(v.id).subscribe({
      next: () => {
        this.mostrarMensaje(`Vehículo ${v.placa} eliminado exitosamente.`, 'success');
        this.cargarVehiculos();
      },
      error: (err: HttpErrorResponse) => {
        
        this.mostrarMensaje(err.error?.mensaje || 'No se pudo eliminar el vehículo', 'error');
      }
    });
  }

  private manejarErrorBackend(err: HttpErrorResponse): void {
    this.guardando = false;
    const errBody: ErrorBackend = err.error;

    if (err.status === 400 && errBody?.campos) {
      this.erroresBackend = errBody.campos;
    } else if (errBody?.mensaje) {
      this.mostrarMensaje(errBody.mensaje, 'error');
    } else {
      this.mostrarMensaje('Ocurrió un error inesperado al procesar la solicitud', 'error');
    }
  }

  private mostrarMensaje(texto: string, tipo: 'error' | 'success'): void {
    this.mensajeAlerta = texto;
    this.tipoAlerta = tipo;
  }
}
