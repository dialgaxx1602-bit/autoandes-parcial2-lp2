import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Directive({
  selector: '[appSiPermiso]',
  standalone: true
})
export class SiPermisoDirective {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  private permisoRequerido = '';
  private tieneVista = false;

  @Input() set appSiPermiso(permiso: string) {
    this.permisoRequerido = permiso;
    this.actualizarVista();
  }

  constructor() {
    
    effect(() => {
      this.authService.permisos();
      this.actualizarVista();
    });
  }

  private actualizarVista(): void {
    const autorizado = this.permisoRequerido ? this.authService.tienePermiso(this.permisoRequerido) : true;

    if (autorizado && !this.tieneVista) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.tieneVista = true;
    } else if (!autorizado && this.tieneVista) {
      this.viewContainer.clear();
      this.tieneVista = false;
    }
  }
}
