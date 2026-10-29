export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
  nombreCompleto: string;
  roles: string[];
  permisos: string[];
}

export interface UsuarioActual {
  id: number;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: string[];
}

export interface Cliente {
  id: number;
  documento: string;
  nombres: string;
  telefono: string;
}

export interface Servicio {
  id?: number;
  codigo: string;
  nombre: string;
  precio: number;
  duracionMin: number;
  activo?: number;
}

export interface Vehiculo {
  id?: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  clienteId: number;
  clienteNombre?: string;
}

export interface DetalleOrdenRequest {
  servicioId: number;
  cantidad: number;
}

export interface OrdenRequest {
  vehiculoId: number;
  kilometraje: number;
  detalles: DetalleOrdenRequest[];
}

export interface DetalleOrdenResponse {
  id: number;
  servicioId: number;
  servicioCodigo: string;
  servicioNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface OrdenResponse {
  id: number;
  numero: string;
  fecha: string;
  vehiculoId: number;
  vehiculoPlaca: string;
  clienteNombre: string;
  kilometraje: number;
  estado: string; 
  total: number;
  usuarioRegistro: string;
  motivoAnulacion?: string;
  detalles: DetalleOrdenResponse[];
}

export interface AnularOrdenRequest {
  motivo: string;
}

export interface ReporteIngresoServicio {
  codigo: string;
  servicio: string;
  cantidadTotal: number;
  importeTotal: number;
}

export interface ErrorBackend {
  timestamp: string;
  status: number;
  error: string;
  mensaje: string;
  ruta: string;
  campos?: { [key: string]: string };
}
