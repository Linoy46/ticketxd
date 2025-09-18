import {
  Component,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  ElementRef,
  OnInit,
} from '@angular/core';
// Importación de clases necesarias de Angular para manejar el ciclo de vida del componente y elementos del DOM.
import { Modal } from 'bootstrap'; // Importa la clase Modal de Bootstrap para manejar el modal.
import { CoreModalService } from '../../core/services/core.modal.service'; // Importa el servicio que maneja el estado del modal.
import { CommonModule } from '@angular/common'; // Importa el módulo común de Angular (usado para pipes, directivas, etc.).
import { SafeUrlPipe } from '../../core/pipes/safe-url.pipe'; // Importa un pipe personalizado que permite manejar URLs de manera segura.
import { Subscription } from 'rxjs'; // Importa Subscription de RxJS para manejar las suscripciones a observables.

@Component({
  selector: 'shared-custom-modal-component', // El selector que se utilizará para insertar este componente en el HTML.
  templateUrl: './shared-custom-modal.component.html', // Ruta del template HTML que define la vista del componente.
  imports: [CommonModule, SafeUrlPipe], // Importación de módulos y pipes necesarios.
  standalone: true, // Mark component as standalone
})
export class SharedCustomModalComponent
  implements AfterViewInit, OnDestroy, OnInit
{
  title = ''; // Propiedad para almacenar el título del modal.
  data = ''; // Propiedad para almacenar los datos que se mostrarán en el modal.
  imageUrl? = null; // Propiedad opcional para almacenar la URL de una imagen a mostrar.
  pdfUrl? = null; // Propiedad opcional para almacenar la URL de un archivo PDF a mostrar.

  // Referencia a un contenedor donde se cargarán dinámicamente los componentes dentro del modal.
  @ViewChild('contentContainer', { read: ViewContainerRef, static: true })
  contentContainer!: ViewContainerRef;

  // Referencia al elemento del modal para inicializar y controlar el modal de Bootstrap.
  @ViewChild('modalElement', { static: true }) modalElement!: ElementRef;

  modalInstance!: Modal;
  private modalSubscription!: Subscription;

  private viewReady = false; // evita race condition
  private pendingData: any = null;
  private isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  private bodyScrollY = 0;
  private clearedTransforms: HTMLElement[] = [];
  private movedToBody = false; // se mantiene para evitar problemas de stacking en iOS

  constructor(private modalService: CoreModalService) {
    this.modalSubscription = this.modalService.modalState$.subscribe(
      (modalData) => {
        this.contentContainer.clear();
        this.resetModalState();
        if (!modalData) {
          if (this.viewReady) this.close();
          return;
        }
        if (!this.viewReady) {
          // posponer hasta AfterViewInit
          this.pendingData = modalData;
          return;
        }
        this.openFromData(modalData);
      }
    );
  }

  ngOnDestroy(): void {
    try {
      this.modalSubscription?.unsubscribe();
    } catch {}
    try {
      if (this.modalInstance) this.modalInstance.hide();
    } catch {}
    if (this.isIOS) this.restoreIOS();
  }

  ngOnInit(): void {
    // Asegurar que el modal tenga la configuración correcta para los dropdowns
    setTimeout(() => {
      const modalElement = document.querySelector('.modal-content');
      if (modalElement) {
        (modalElement as HTMLElement).style.overflow = 'visible';
      }

      const modalDialog = document.querySelector('.modal-dialog');
      if (modalDialog) {
        (modalDialog as HTMLElement).style.overflow = 'visible';
      }
    }, 100);
  }

  ngAfterViewInit() {
    this.modalInstance = new Modal(this.modalElement.nativeElement);
    // mover a body (iOS stacking / transforms)
    if (!this.movedToBody) {
      try {
        document.body.appendChild(this.modalElement.nativeElement);
        this.movedToBody = true;
      } catch {}
    }
    this.viewReady = true;
    if (this.pendingData) {
      const d = this.pendingData;
      this.pendingData = null;
      this.openFromData(d);
    }
    const el: HTMLElement = this.modalElement.nativeElement;
    el.addEventListener('shown.bs.modal', () => {
      if (this.isIOS) this.applyIOSFixes();
    });
    el.addEventListener('hidden.bs.modal', () => {
      if (this.isIOS) this.restoreIOS();
    });
    if (this.isIOS) window.addEventListener('resize', this.updateVH);
  }

  // Método para cerrar el modal y limpiar para no tener conflictos al abrir otro modal
  private openFromData(modalData: any) {
    this.title = modalData.title;
    this.imageUrl = modalData.imageUrl;
    this.pdfUrl = modalData.pdfUrl;
    this.data = modalData.data;
    if (modalData.component) {
      this.loadComponent(modalData.component, this.data);
    } else {
      this.safeShow();
    }
  }

  private loadComponent(component: any, data: any) {
    this.contentContainer.clear();
    if (component) {
      const componentRef = this.contentContainer.createComponent(component);
      Object.assign(componentRef.instance as any, {
        ...data,
        close: () => this.close(),
      });
    }
    this.safeShow();
  }

  private safeShow() {
    if (!this.modalInstance) return;
    try {
      this.modalInstance.show();
    } catch {
      requestAnimationFrame(() => {
        try {
          this.modalInstance.show();
        } catch {}
      });
    }
  }

  close() {
    if (this.modalInstance) {
      try {
        this.modalInstance.hide();
      } catch {}
    }
    this.contentContainer.clear();
    this.resetModalState();
  }

  private resetModalState() {
    this.title = '';
    this.data = '';
    this.imageUrl = null;
    this.pdfUrl = null;
  }

  // iOS ajustes mínimos para modales
  private applyIOSFixes() {
    this.bodyScrollY = window.scrollY;
    // Scroll lock sin alterar hit-testing: sólo overflow hidden (evita desalineación de taps)
    document.body.style.overflow = 'hidden';
    // Ajustar altura viewport dinámica
    this.updateVH();
    // Limpiar transforms de ancestros (por si el modal NO se movió antes de tiempo)
    this.clearAncestorTransforms();
  }

  private restoreIOS() {
    document.body.style.overflow = '';
    window.scrollTo(0, this.bodyScrollY);
    this.clearedTransforms.forEach((el) => (el.style.transform = ''));
    this.clearedTransforms = [];
  }

  private updateVH = () => {
    if (!this.isIOS) return;
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  private clearAncestorTransforms() {
    this.clearedTransforms = [];
    let el: HTMLElement | null = this.modalElement.nativeElement.parentElement;
    while (el && el !== document.body) {
      const t = getComputedStyle(el).transform;
      if (t && t !== 'none') {
        this.clearedTransforms.push(el);
        el.style.transform = 'none';
      }
      el = el.parentElement;
    }
  }
}
