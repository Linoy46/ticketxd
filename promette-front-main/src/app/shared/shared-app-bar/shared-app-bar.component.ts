import { Component, EventEmitter, Input, Output, ElementRef, HostListener, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthLoginService } from '../../main/auth/services/auth.login.service';
import { CommonModule } from '@angular/common';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { PermisionsDirective } from '../../core/directives/permissions/has-permission.directive';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../store';

@Component({
  selector: 'shared-app-bar-component',
  templateUrl: './shared-app-bar.component.html',
  styleUrls: ['./shared-app-bar.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    NotificationListComponent,
    //PermisionsDirective,
  ],
  standalone: true,
})
export class SharedAppBarComponent {
  @Output() toggleDrawerEvent = new EventEmitter<void>();
  @Input() show?: boolean; // Propiedad para controlar la visibilidad
  @Input() logo?: string; // Propiedad para el logo
  isProfileOpen = false;
  @ViewChild(NotificationListComponent) notificationList!: NotificationListComponent;

  // Objeto para mantener el estado de todos los overlays
  overlayStates: { [key: string]: boolean } = {
    profile: false,
    notifications: false
    // Aquí puedes añadir más overlays según necesites
  };

  // ViewChildren para obtener todos los componentes con overlays
  @ViewChildren(NotificationListComponent) overlayComponents!: QueryList<any>;

  constructor(
    private authService: AuthLoginService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  private permissionsSelector = injectSelector<RootState, any>(
    (state) => state.auth.permissions
  );
  // Aquí se obtiene el usuario con un getter
  get permissions() {
    return this.permissionsSelector(); // Se actualiza automáticamente
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      // Cerrar todos los overlays
      Object.keys(this.overlayStates).forEach(key => {
        this.overlayStates[key] = false;
      });
      // Cerrar overlays en componentes hijos
      this.overlayComponents.forEach(component => {
        if (component.isOpen) {
          component.isOpen = false;
        }
      });
    }
  }

  toggleOverlay(overlayName: string, event: Event): void {
    event.stopPropagation();

    // Cerrar todos los demás overlays
    Object.keys(this.overlayStates).forEach(key => {
      if (key !== overlayName) {
        this.overlayStates [key] = false;
      }
    });

    // Cerrar overlays en componentes hijos
    this.overlayComponents.forEach(component => {
      if (component.isOpen && overlayName !== 'notifications') {
        component.isOpen = false;
      }
    });

    // Toggle el overlay actual
    this.overlayStates[overlayName] = !this.overlayStates[overlayName];
  }

  toggleDrawer() {
    this.toggleDrawerEvent.emit();
  }
  // Método para cerrar sesión
  logout(): void {
    this.authService.logout(); // Llama al servicio de autenticación para cerrar sesión
    this.router.navigate(['/login']); // Redirige al usuario a la página de login
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

}
