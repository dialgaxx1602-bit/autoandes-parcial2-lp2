import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vehiculo } from '../models/autoandes.models';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vehiculos`;

  listar(clienteId?: number): Observable<Vehiculo[]> {
    let params = new HttpParams();
    if (clienteId) {
      params = params.set('clienteId', clienteId.toString());
    }
    return this.http.get<Vehiculo[]>(this.apiUrl, { params });
  }

  buscarPorId(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.apiUrl}/${id}`);
  }

  crear(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.apiUrl, vehiculo);
  }

  actualizar(id: number, vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.apiUrl}/${id}`, vehiculo);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
