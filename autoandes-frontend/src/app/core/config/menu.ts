export interface MenuItem {
  titulo: string;
  ruta: string;
  icono: string;
  permisoRequerido: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    titulo: 'Órdenes de Servicio',
    ruta: '/ordenes',
    icono: 'clipboard-list',
    permisoRequerido: 'ORDEN_LEER'
  },
  {
    titulo: 'Nueva Orden',
    ruta: '/ordenes/nueva',
    icono: 'plus-circle',
    permisoRequerido: 'ORDEN_REGISTRAR'
  },
  {
    titulo: 'Vehículos',
    ruta: '/vehiculos',
    icono: 'car',
    permisoRequerido: 'VEHICULO_LEER'
  },
  {
    titulo: 'Catálogo de Servicios',
    ruta: '/servicios',
    icono: 'tools',
    permisoRequerido: 'SERVICIO_LEER'
  },
  {
    titulo: 'Reporte de Ingresos',
    ruta: '/reportes',
    icono: 'chart-bar',
    permisoRequerido: 'REPORTE_VER'
  }
];
