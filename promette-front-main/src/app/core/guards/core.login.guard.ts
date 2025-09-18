import { Injectable } from '@angular/core';
import {
  CanActivate, // Interfaz para proteger rutas y controlar el acceso
  ActivatedRouteSnapshot, // Contiene información sobre la ruta activada
  RouterStateSnapshot, // Contiene el estado de la ruta activada
  Router, // Servicio para realizar navegación en Angular
} from '@angular/router'; // Importación de funcionalidades relacionadas con el enrutamiento de Angular
import { AuthLoginService } from '../../main/auth/services/auth.login.service'; // Servicio para manejar la autenticación del usuario

@Injectable({
  providedIn: 'root', // Esto hace que el servicio esté disponible globalmente en la aplicación
})
export class CoreLoginGuard implements CanActivate {
  private isLoggedIn!: boolean;

  // Constructor para inyectar los servicios necesarios
  constructor(private authService: AuthLoginService, private router: Router) {}

  // Método canActivate, se ejecuta cuando el usuario intenta acceder a una ruta protegida
  canActivate(
    route: ActivatedRouteSnapshot, // Contiene información sobre la ruta que se intenta activar
    state: RouterStateSnapshot // Contiene el estado del router, como la URL de la ruta
  ): boolean {
    if (this.authService.isLoggedIn()) {
      // Si el usuario está autenticado, redirige a la página de panel
      this.router.navigate(['promette']);
      return false; // Bloquea el acceso a la ruta actual
    } else {
      // Si el usuario no está autenticado, permite el acceso a la ruta actual (login)
      return true;
    }
  }
}
