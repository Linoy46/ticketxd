// Importa las funcionalidades necesarias de Angular para proteger las rutas y realizar la navegación
import { Injectable } from '@angular/core';
import {
  CanActivate, // Interfaz utilizada para proteger las rutas en Angular
  ActivatedRouteSnapshot, // Contiene información sobre la ruta activada
  RouterStateSnapshot, // Contiene información sobre el estado de la ruta activada
  Router, // Servicio utilizado para la navegación
} from '@angular/router'; // Importación de funcionalidades relacionadas con la navegación en Angular
import { AuthLoginService } from '../../main/auth/services/auth.login.service'; // Servicio de autenticación para verificar el estado del usuario

// El decorador Injectable hace que este servicio esté disponible en toda la aplicación
@Injectable({
  providedIn: 'root', // Esto hace que el servicio esté disponible a nivel global de la aplicación
})
export class CoreAuthGuard implements CanActivate {
  // La clase implementa la interfaz CanActivate para proteger las rutas

  // Constructor que inyecta los servicios necesarios
  constructor(private authService: AuthLoginService, private router: Router) {}

  // El método canActivate se usa para determinar si la ruta puede ser activada o no
  canActivate(
    route: ActivatedRouteSnapshot, // Contiene información sobre la ruta que se está activando
    state: RouterStateSnapshot // Contiene el estado del router, como la URL actual
  ): boolean {
    if (this.authService.isLoggedIn()) {
      // Si el servicio de autenticación indica que el usuario está logueado
      this.authService.isLoggedInInfo().subscribe();
      return true; // Permite la activación de la ruta
    } else {
      // Si el usuario no está autenticado, lo redirige a la página de login
      this.router.navigate(['/auth/login']);
      return false; // Bloquea el acceso a la ruta
    }
  }
}
