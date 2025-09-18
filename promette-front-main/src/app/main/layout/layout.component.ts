import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  NgZone,
  ViewChild,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SharedLoadingComponent } from '../../shared/shared-loading/shared-loading.component';
import { SharedInactivityComponent } from '../../shared/shared-inactivity/shared-inactivity.component';
import { CoreLoadingService } from '../../core/services/core.loading.service';

import { SharedAppBarComponent } from '../../shared/shared-app-bar/shared-app-bar.component';
import { SharedBreadCrumbComponent } from '../../shared/shared-bread-crumb/shared-bread-crumb.component';
import { SharedDrawerComponent } from '../../shared/shared-drawer/shared-drawer.component';

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterOutlet,
    SharedLoadingComponent, // Muestra el indicador de carga
    SharedInactivityComponent, // Muestra el modal de inactividad
    SharedAppBarComponent,
    SharedDrawerComponent,
    SharedBreadCrumbComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  isMini = false;

  // Solo para detectar si es móvil asi que no afecta la responsividad de escritorio
  private isSmallScreen = false;
  private resizeListener?: () => void;

  public openRenewTokenModal = false; // Controla la visibilidad del modal de inactividad
  private timeoutId: any; // Identificador del temporizador para inactividad
  private readonly timeoutDuration = 3000000; // Duración en milisegundos para inactividad antes de mostrar el modal
  public loading: boolean = false; // Indica si la aplicación está cargando o no

  constructor(
    private ngZone: NgZone, // Permite ejecutar funciones dentro del contexto Angular para detectar cambios
    private loadingService: CoreLoadingService, // Servicio que gestiona el estado de carga
    private router: Router // Para escuchar cambios de ruta
  ) {
    // Suscripción al estado de carga del servicio CoreLoadingService
    this.loadingService.loading$.subscribe((isLoading: boolean) => {
      this.loading = isLoading; // Actualiza la propiedad 'loading' según el estado del servicio
    });

    // Escuchar cambios de ruta para cerrar el drawer en móviles para que nose despliegue cuando el usuario le de clic en otro menú
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isSmallScreen) {
          this.closeMobileDrawer();
        }
      });

    this.startTimer(); // Inicia el temporizador al cargar el componente
  }

  ngOnInit() {
    this.checkScreenSize();
    this.setupResizeListener();
  }

  ngOnDestroy() {
    this.clearTimer();
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  // Detecta el tamaño de pantalla
  private checkScreenSize(): void {
    this.isSmallScreen = window.innerWidth < 768; //Verifica el tamaño de la pantalla
  }

  // Configura el listener para resize
  private setupResizeListener(): void {
    this.resizeListener = () => {
      this.ngZone.run(() => {
        this.checkScreenSize();
      });
    };
    window.addEventListener('resize', this.resizeListener); //se crea una función que se ejecutará cada vez que se cambie de pantalla por ejemplo a horizontal
  }

  // Detecta cualquier acción del usuario (movimiento del ratón, tecla presionada, clic)
  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:keydown', ['$event'])
  @HostListener('window:click', ['$event'])
  resetTimer(): void {
    this.startTimer(); // Reinicia el temporizador cuando el usuario realiza una acción
  }

  // Inicia el temporizador de inactividad
  private startTimer(): void {
    this.openRenewTokenModal = false; // Asegura que el modal no se muestre al iniciar el temporizador
    this.clearTimer(); // Limpia cualquier temporizador previo
    this.timeoutId = setTimeout(
      () => this.handleInactivity(), // Llama al manejador de inactividad después del tiempo establecido
      this.timeoutDuration // Duración antes de que se considere inactividad (3000 ms)
    );
  }

  // Limpia el temporizador en caso de que sea necesario
  private clearTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId); // Cancela el temporizador previo
    }
  }

  // Maneja la inactividad, muestra el modal de renovación de token
  private handleInactivity(): void {
    this.ngZone.run(() => {
      this.openRenewTokenModal = true; // Muestra el modal de renovación de token cuando hay inactividad
    });
  }

  toggleDrawer() {
    if (this.isSmallScreen) {
      // En móviles: mostrar/ocultar drawer con CSS
      const drawer = document.querySelector(
        'shared-drawer-component'
      ) as HTMLElement;
      if (drawer) {
        const isVisible = drawer.classList.contains('mobile-drawer-visible');
        if (isVisible) {
          drawer.classList.remove('mobile-drawer-visible');
          this.removeMobileOverlay();
        } else {
          drawer.classList.add('mobile-drawer-visible');
          this.createMobileOverlay();
        }
      }
    } else {
      // En escritorio: comportamiento igual
      this.isMini = !this.isMini;
    }
  }

  // Crear overlay para cerrar drawer en móvil
  private createMobileOverlay(): void {
    const existingOverlay = document.querySelector('.mobile-drawer-overlay');
    if (existingOverlay) return;

    const overlay = document.createElement('div');
    overlay.className = 'mobile-drawer-overlay';
    overlay.addEventListener('click', () => this.closeMobileDrawer());
    document.body.appendChild(overlay);
  }

  // Remover overlay
  private removeMobileOverlay(): void {
    const overlay = document.querySelector('.mobile-drawer-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  // Cerrar drawer móvil
  private closeMobileDrawer(): void {
    const drawer = document.querySelector(
      'shared-drawer-component'
    ) as HTMLElement;
    if (drawer) {
      drawer.classList.remove('mobile-drawer-visible');
    }
    this.removeMobileOverlay();
  }
}
