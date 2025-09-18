// Importación de módulos necesarios
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core'; // Importación de decoradores y interfaces de Angular
import { CommonModule } from '@angular/common'; // Para usar directivas comunes en Angular
import { AuthLoginService } from '../../main/auth/services/auth.login.service';
// Servicio de autenticación
declare var bootstrap: any; // Importación de Bootstrap para usar su Modal

@Component({
  selector: 'shared-inactivity-component', // Selector del componente, usado en el HTML
  templateUrl: './shared-inactivity.component.html', // Ruta del archivo de plantilla
  imports: [CommonModule], // Módulos que se importan para que estén disponibles en el componente
})
export class SharedInactivityComponent implements OnChanges, OnInit {
  @Input() openRenewTokenModal: boolean = false; // Propiedad de entrada para controlar la visibilidad del modal

  private timeoutId: any; // Identificador para el temporizador de inactividad
  private readonly responseTime = 10 * 1000; // Tiempo máximo de inactividad antes de hacer logout (10 segundos)
  private modalElement: any; // Elemento del modal de Bootstrap
  private modalInstance: any; // Instancia del modal de Bootstrap
  progress: number = 100; // Progreso de la barra de progreso que indica el tiempo restante
  private intervalId: any; // Identificador para el intervalo que actualiza la barra de progreso

  constructor(private authService: AuthLoginService) { }

  // ngOnInit se ejecuta cuando el componente se inicializa
  ngOnInit(): void {
    // Obtiene el modal de la plantilla
    this.modalElement = document.getElementById('inactivityModal');
    // Crea una instancia de modal de Bootstrap
    this.modalInstance = new bootstrap.Modal(this.modalElement, {
      backdrop: false, // Desactiva el fondo gris del modal
    });
  }

  // ngOnChanges se ejecuta cada vez que cambia alguna propiedad de entrada
  ngOnChanges(changes: SimpleChanges): void {
    // Si openRenewTokenModal es true, muestra el modal y comienza el temporizador
    if (this.openRenewTokenModal) {
      this.modalInstance.show(); // Muestra el modal
      this.startResponseTimer(); // Inicia el temporizador para cerrar sesión
      this.startProgressBar(); // Inicia la barra de progreso
    }
  }

  // Inicia la barra de progreso
  private startProgressBar(): void {
    this.progress = 100; // Resetea el progreso a 100%
    const intervalTime = this.responseTime / 100; // Divide el tiempo total entre 100 para obtener el intervalo
    // Actualiza la barra de progreso en cada intervalo
    this.intervalId = setInterval(() => {
      this.progress -= 1; // Reduce el progreso en un 1% en cada intervalo
      if (this.progress <= 0) {
        clearInterval(this.intervalId); // Detiene el intervalo cuando la barra de progreso llega a 0
      }
    }, intervalTime);
  }

  // Inicia el temporizador para cerrar sesión automáticamente
  private startResponseTimer(): void {
    this.clearResponseTimer(); // Limpia cualquier temporizador anterior
    // Cierra sesión si no hay respuesta en el tiempo especificado
    this.timeoutId = setTimeout(() => this.logOut(), this.responseTime);
  }

  // Limpia el temporizador de respuesta
  private clearResponseTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId); // Cancela el temporizador de inactividad
    }
  }

  // Realiza el logout del usuario
  logOut(): void {
    this.clearResponseTimer(); // Limpia cualquier temporizador pendiente
    this.authService.logout(); // Llama al servicio de autenticación para cerrar sesión
  }

  // Renueva la sesión si el usuario interactúa
  renewSession(): void {
    this.modalInstance.hide(); // Cierra el modal
    this.clearResponseTimer(); // Limpia el temporizador de inactividad
    // Llama al servicio para renovar el token
    this.authService.renewToken().subscribe((success) => {
      if (success) {
        console.log(success); // Muestra el éxito en la consola
      }
    });
  }
}
