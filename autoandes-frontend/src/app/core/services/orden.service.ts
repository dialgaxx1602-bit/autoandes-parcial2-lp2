import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  OrdenRequest,
  OrdenResponse,
  AnularOrdenRequest,
  ReporteIngresoServicio
} from '../models/autoandes.models';

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ordenes`;
  private reporteUrl = `${environment.apiUrl}/reportes`;

  registrar(orden: OrdenRequest): Observable<OrdenResponse> {
    return this.http.post<OrdenResponse>(this.apiUrl, orden);
  }

  listar(filtros?: { placa?: string; estado?: string; desde?: string; hasta?: string }): Observable<OrdenResponse[]> {
    let params = new HttpParams();
    if (filtros?.placa) params = params.set('placa', filtros.placa);
    if (filtros?.estado) params = params.set('estado', filtros.estado);
    if (filtros?.desde) params = params.set('desde', filtros.desde);
    if (filtros?.hasta) params = params.set('hasta', filtros.hasta);

    return this.http.get<OrdenResponse[]>(this.apiUrl, { params });
  }

  buscarPorId(id: number): Observable<OrdenResponse> {
    return this.http.get<OrdenResponse>(`${this.apiUrl}/${id}`);
  }

  anular(id: number, request: AnularOrdenRequest): Observable<OrdenResponse> {
    return this.http.patch<OrdenResponse>(`${this.apiUrl}/${id}/anular`, request);
  }

  reporteIngresosPorServicio(desde?: string, hasta?: string): Observable<ReporteIngresoServicio[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get<ReporteIngresoServicio[]>(`${this.reporteUrl}/ingresos-por-servicio`, { params });
  }
}
