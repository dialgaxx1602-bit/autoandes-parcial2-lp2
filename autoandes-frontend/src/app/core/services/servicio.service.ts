import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Servicio } from '../models/autoandes.models';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/servicios`;

  listar(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.apiUrl}/${id}`);
  }

  crear(servicio: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(this.apiUrl, servicio);
  }

  actualizar(id: number, servicio: Servicio): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.apiUrl}/${id}`, servicio);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  cambiarEstado(id: number): Observable<Servicio> {
    return this.http.patch<Servicio>(`${this.apiUrl}/${id}/estado`, {});
  }
}
