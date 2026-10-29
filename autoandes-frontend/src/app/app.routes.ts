import { Routes } from '@angular/router';
import { authGuard, invitadoGuard, permisoGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [invitadoGuard]
  },

  
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'ordenes'
      },
      
      {
        path: 'ordenes',
        loadComponent: () => import('./features/ordenes/orden-consulta.component').then(m => m.OrdenConsultaComponent),
        canActivate: [permisoGuard],
        data: { permiso: 'ORDEN_LEER' }
      },
      {
        path: 'ordenes/nueva',
        loadComponent: () => import('./features/ordenes/orden-registro.component').then(m => m.OrdenRegistroComponent),
        canActivate: [permisoGuard],
        data: { permiso: 'ORDEN_REGISTRAR' }
      },
      
      {
        path: 'vehiculos',
        loadComponent: () => import('./features/vehiculos/vehiculos.component').then(m => m.VehiculosComponent),
        canActivate: [permisoGuard],
        data: { permiso: 'VEHICULO_LEER' }
      },
      
      {
        path: 'servicios',
        loadComponent: () => import('./features/servicios/servicios.component').then(m => m.ServiciosComponent),
        canActivate: [permisoGuard],
        data: { permiso: 'SERVICIO_LEER' }
      },
      
      {
        path: 'reportes',
        loadComponent: () => import('./features/reportes/reportes.component').then(m => m.ReportesComponent),
        canActivate: [permisoGuard],
        data: { permiso: 'REPORTE_VER' }
      },
      
      {
        path: 'acceso-denegado',
        loadComponent: () => import('./shared/pages/acceso-denegado/acceso-denegado.component').then(m => m.AccesoDenegadoComponent)
      }
    ]
  },

  
  {
    path: '**',
    loadComponent: () => import('./shared/pages/no-encontrado/no-encontrado.component').then(m => m.NoEncontradoComponent)
  }
];
