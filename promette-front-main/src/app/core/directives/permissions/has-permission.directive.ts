import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { PermissionsService } from '../../services/core.permissions.service';

@Directive({
  selector: '[hasPermission]',
})
export class PermisionsDirective implements OnInit {
  @Input() hasPermission: string = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private permisosService: PermissionsService
  ) {}

  ngOnInit() {
    // Ocultar el elemento por defecto
    this.renderer.setStyle(this.el.nativeElement, 'display', 'none');

    this.permisosService
      .havePermission(this.hasPermission)
      .then((hasPermission) => {
        console.log(`Permiso (${this.hasPermission}):`, hasPermission);

        if (hasPermission) {
          this.renderer.setStyle(this.el.nativeElement, 'display', ''); // Mostrar el elemento
        }
      })
      .catch((error) => {
        console.error('Error checking permission:', error);
      });
  }
}
