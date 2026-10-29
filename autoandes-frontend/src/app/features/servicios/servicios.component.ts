import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServicioService } from '../../core/services/servicio.service';
import { AuthService } from '../../core/auth/auth.service';
import { Servicio, ErrorBackend } from '../../core/models/autoandes.models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h2>Catálogo de Servicios</h2>
          <p class="subtitle">Administración de tarifas, tiempos y estado de servicios del taller</p>
        </div>
        @if (authService.tienePermiso('SERVICIO_ESCRIBIR')) {
          <button (click)="abrirModalNuevo()" class="btn-primary">
            + Nuevo Servicio
          </button>
        }
      </div>

      
      @if (mensajeAlerta) {
        <div [class]="tipoAlerta === 'error' ? 'alert-danger' : 'alert-success'">
          {{ mensajeAlerta }}
          <button (click)="mensajeAlerta = ''" class="btn-close-alert">×</button>
        </div>
      }

      
      <div class="search-bar">
        <input
          type="text"
          [(ngModel)]="terminoBusqueda"
          placeholder="Buscar por código (SRV-...) o nombre de servicio..."
          class="form-control"
        />
      </div>

      
      <div class="card table-card">
        @if (cargando) {
          <div class="loading-state">
            <p>Cargando servicios...</p>
          </div>
        } @else if (serviciosFiltrados.length === 0) {
          <div class="empty-state">
            <p>No se encontraron servicios registrados.</p>
          </div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Servicio</th>
                <th>Precio (S/)</th>
                <th>Duración</th>
                <th>Estado</th>
                @if (authService.tienePermiso('SERVICIO_ESCRIBIR')) {
                  <th class="actions-col">Acciones</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (s of serviciosFiltrados; track s.id) {
                <tr [class.inactive-row]="s.activo === 0">
                  <td class="code-cell">{{ s.codigo }}</td>
                  <td class="name-cell">{{ s.nombre }}</td>
                  <td class="price-cell">S/ {{ s.precio | number:'1.2-2' }}</td>
                  <td>{{ s.duracionMin }} min</td>
                  <td>
                    <span [class]="s.activo === 1 ? 'badge-active' : 'badge-inactive'">
                      {{ s.activo === 1 ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  @if (authService.tienePermiso('SERVICIO_ESCRIBIR')) {
                    <td class="actions-col">
                      <button (click)="abrirModalEditar(s)" class="btn-action edit" title="Editar">
                        Editar
                      </button>
                      <button
                        (click)="cambiarEstado(s)"
                        [class]="s.activo === 1 ? 'btn-action deactivate' : 'btn-action activate'"
                        [title]="s.activo === 1 ? 'Dar de baja (PATCH)' : 'Reactivar'"
                      >
                        {{ s.activo === 1 ? 'Dar de baja' : 'Reactivar' }}
                      </button>
                      <button (click)="eliminar(s)" class="btn-action delete" title="Eliminar físico">
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
              <h3>{{ modoEdicion ? 'Editar Servicio: ' + servicioSeleccionado?.codigo : 'Registrar Nuevo Servicio' }}</h3>
              <button (click)="cerrarModal()" class="btn-close">×</button>
            </div>

            <form [formGroup]="servicioForm" (ngSubmit)="guardarServicio()">
              <div class="form-group">
                <label for="codigo">Código (Patrón SRV-000)</label>
                <input
                  id="codigo"
                  type="text"
                  formControlName="codigo"
                  placeholder="SRV-001"
                  class="form-control"
                  [class.is-invalid]="erroresBackend['codigo'] || (servicioForm.get('codigo')?.touched && servicioForm.get('codigo')?.invalid)"
                />
                @if (erroresBackend['codigo']) {
                  <small class="error-text">{{ erroresBackend['codigo'] }}</small>
                } @else if (servicioForm.get('codigo')?.touched && servicioForm.get('codigo')?.errors?.['required']) {
                  <small class="error-text">El código es obligatorio</small>
                } @else if (servicioForm.get('codigo')?.touched && servicioForm.get('codigo')?.errors?.['pattern']) {
                  <small class="error-text">El código debe tener el patrón SRV-000</small>
                }
              </div>

              <div class="form-group">
                <label for="nombre">Nombre del Servicio (3 a 80 caracteres)</label>
                <input
                  id="nombre"
                  type="text"
                  formControlName="nombre"
                  placeholder="Ej. Cambio de bujías"
                  class="form-control"
                  [class.is-invalid]="erroresBackend['nombre'] || (servicioForm.get('nombre')?.touched && servicioForm.get('nombre')?.invalid)"
                />
                @if (erroresBackend['nombre']) {
                  <small class="error-text">{{ erroresBackend['nombre'] }}</small>
                } @else if (servicioForm.get('nombre')?.touched && servicioForm.get('nombre')?.errors?.['required']) {
                  <small class="error-text">El nombre es obligatorio</small>
                } @else if (servicioForm.get('nombre')?.touched && (servicioForm.get('nombre')?.errors?.['minlength'] || servicioForm.get('nombre')?.errors?.['maxlength'])) {
                  <small class="error-text">Debe tener entre 3 y 80 caracteres</small>
                }
              </div>

              <div class="form-row">
                <div class="form-group col">
                  <label for="precio">Precio S/ (Mayor a 0)</label>
                  <input
                    id="precio"
                    type="number"
                    step="0.01"
                    formControlName="precio"
                    placeholder="120.00"
                    class="form-control"
                    [class.is-invalid]="erroresBackend['precio'] || (servicioForm.get('precio')?.touched && servicioForm.get('precio')?.invalid)"
                  />
                  @if (erroresBackend['precio']) {
                    <small class="error-text">{{ erroresBackend['precio'] }}</small>
                  } @else if (servicioForm.get('precio')?.touched && servicioForm.get('precio')?.errors?.['min']) {
                    <small class="error-text">El precio debe ser mayor a 0</small>
                  }
                </div>

                <div class="form-group col">
                  <label for="duracionMin">Duración (15 a 480 min)</label>
                  <input
                    id="duracionMin"
                    type="number"
                    formControlName="duracionMin"
                    placeholder="60"
                    class="form-control"
                    [class.is-invalid]="erroresBackend['duracionMin'] || (servicioForm.get('duracionMin')?.touched && servicioForm.get('duracionMin')?.invalid)"
                  />
                  @if (erroresBackend['duracionMin']) {
                    <small class="error-text">{{ erroresBackend['duracionMin'] }}</small>
                  } @else if (servicioForm.get('duracionMin')?.touched && (servicioForm.get('duracionMin')?.errors?.['min'] || servicioForm.get('duracionMin')?.errors?.['max'])) {
                    <small class="error-text">La duración debe ser entre 15 y 480 minutos</small>
                  }
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" (click)="cerrarModal()" class="btn-secondary">Cancelar</button>
                <button type="submit" [disabled]="servicioForm.invalid || guardando" class="btn-primary">
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
    .search-bar {
      margin-bottom: 1.25rem;
    }
    .form-control {
      width: 100%;
      padding: 0.65rem 0.85rem;
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
    .inactive-row {
      background: #fafafa;
      color: #94a3b8;
    }
    .code-cell {
      font-family: monospace;
      font-weight: 700;
      color: #1e3a8a;
    }
    .price-cell {
      font-weight: 600;
    }
    .badge-active {
      background: #dcfce7;
      color: #15803d;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-inactive {
      background: #f1f5f9;
      color: #64748b;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
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
    .btn-action.deactivate {
      background: #fef3c7;
      color: #b45309;
    }
    .btn-action.deactivate:hover { background: #fde68a; }
    .btn-action.activate {
      background: #dcfce7;
      color: #15803d;
    }
    .btn-action.activate:hover { background: #bbf7d0; }
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
      max-width: 520px;
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
    label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.35rem;
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
export class ServiciosComponent implements OnInit {
  private servicioService = inject(ServicioService);
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  servicios: Servicio[] = [];
  cargando = false;
  guardando = false;
  terminoBusqueda = '';

  mensajeAlerta = '';
  tipoAlerta: 'error' | 'success' = 'success';
  erroresBackend: { [campo: string]: string } = {};

  mostrarModal = false;
  modoEdicion = false;
  servicioSeleccionado: Servicio | null = null;

  servicioForm = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern('^SRV-\\d{3}$')]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    duracionMin: [60, [Validators.required, Validators.min(15), Validators.max(480)]]
  });

  ngOnInit(): void {
    this.cargarServicios();
  }

  get serviciosFiltrados(): Servicio[] {
    if (!this.terminoBusqueda.trim()) return this.servicios;
    const t = this.terminoBusqueda.toLowerCase();
    return this.servicios.filter(s =>
      s.codigo.toLowerCase().includes(t) || s.nombre.toLowerCase().includes(t)
    );
  }

  cargarServicios(): void {
    this.cargando = true;
    this.servicioService.listar().subscribe({
      next: (data) => {
        this.servicios = data;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.mostrarMensaje(err.error?.mensaje || 'Error al cargar servicios', 'error');
      }
    });
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.servicioSeleccionado = null;
    this.erroresBackend = {};
    this.servicioForm.reset({
      codigo: '',
      nombre: '',
      precio: 0,
      duracionMin: 60
    });
    this.mostrarModal = true;
  }

  abrirModalEditar(s: Servicio): void {
    this.modoEdicion = true;
    this.servicioSeleccionado = s;
    this.erroresBackend = {};
    this.servicioForm.patchValue({
      codigo: s.codigo,
      nombre: s.nombre,
      precio: s.precio,
      duracionMin: s.duracionMin
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.erroresBackend = {};
  }

  guardarServicio(): void {
    if (this.servicioForm.invalid) return;

    this.guardando = true;
    this.erroresBackend = {};

    const formVal = this.servicioForm.getRawValue();
    const req: Servicio = {
      codigo: formVal.codigo!,
      nombre: formVal.nombre!,
      precio: Number(formVal.precio),
      duracionMin: Number(formVal.duracionMin)
    };

    if (this.modoEdicion && this.servicioSeleccionado?.id) {
      this.servicioService.actualizar(this.servicioSeleccionado.id, req).subscribe({
        next: (actualizado) => {
          this.guardando = false;
          this.cerrarModal();
          this.mostrarMensaje(`Servicio ${actualizado.codigo} actualizado correctamente.`, 'success');
          this.cargarServicios();
        },
        error: (err: HttpErrorResponse) => this.manejarErrorBackend(err)
      });
    } else {
      this.servicioService.crear(req).subscribe({
        next: (creado) => {
          this.guardando = false;
          this.cerrarModal();
          this.mostrarMensaje(`Servicio ${creado.codigo} registrado exitosamente.`, 'success');
          this.cargarServicios();
        },
        error: (err: HttpErrorResponse) => this.manejarErrorBackend(err)
      });
    }
  }

  cambiarEstado(s: Servicio): void {
    if (!s.id) return;
    const accion = s.activo === 1 ? 'dar de baja' : 'reactivar';
    if (!confirm(`¿Está seguro de que desea ${accion} el servicio ${s.codigo}?`)) return;

    this.servicioService.cambiarEstado(s.id).subscribe({
      next: (actualizado) => {
        this.mostrarMensaje(`Servicio ${actualizado.codigo} ahora está ${actualizado.activo === 1 ? 'Activo' : 'Inactivo'}.`, 'success');
        this.cargarServicios();
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarMensaje(err.error?.mensaje || 'Error al cambiar estado del servicio', 'error');
      }
    });
  }

  eliminar(s: Servicio): void {
    if (!s.id) return;
    if (!confirm(`¿Desea intentar eliminar físicamente el servicio ${s.codigo}? Nota: Si tiene órdenes asociadas el backend responderá 409.`)) return;

    this.servicioService.eliminar(s.id).subscribe({
      next: () => {
        this.mostrarMensaje(`Servicio ${s.codigo} eliminado correctamente.`, 'success');
        this.cargarServicios();
      },
      error: (err: HttpErrorResponse) => {
        
        this.mostrarMensaje(err.error?.mensaje || 'No se pudo eliminar el servicio', 'error');
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
