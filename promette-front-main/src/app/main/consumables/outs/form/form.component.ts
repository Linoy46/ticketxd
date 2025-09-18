import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { OutsService } from '../services/outs.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  /**
   * Mensaje a mostrar en el componente
   */
  @Input() message: string = '¿Está seguro que desea realizar esta acción?';

  /**
   * Texto para el botón de confirmación
   */
  @Input() confirmText: string = 'Confirmar';

  /**
   * Texto para el botón de cancelación
   */
  @Input() cancelText: string = 'Cancelar';

  /**
   * Función a ejecutar cuando se confirma
   */
  @Input() onConfirm: () => void = () => {};

  /**
   * Función a ejecutar cuando se cancela
   */
  @Input() onCancel: () => void = () => {};

  /**
   * Indica si se deben ocultar los botones
   */
  @Input() hideButtons: boolean = false;

  /**
   * Indica si se debe mostrar el spinner de carga
   */
  @Input() showSpinner: boolean = false;

  /**
   * Indica si la operación fue exitosa
   */
  @Input() isSuccess: boolean = false;

  /**
   * Indica si hubo un error
   */
  @Input() isError: boolean = false;

  // Propiedades para manejar el PDF
  pdfSrc: SafeResourceUrl | null = null;
  pdfTitle: string = 'Documento';
  isLoading = false;

  constructor(
    private modalService: NgbModal,
    private sanitizer: DomSanitizer,
    private alertService: CoreAlertService,
    private outsService: OutsService
  ) {}

  ngOnInit(): void {
    // Inicialización del componente
  }

  /**
   * Ejecuta la función de confirmación
   */
  confirm(): void {
    if (this.onConfirm) {
      this.onConfirm();
    }
  }

  /**
   * Ejecuta la función de cancelación
   */
  cancel(): void {
    if (this.onCancel) {
      this.onCancel();
    }
  }

  /**
   * Muestra el PDF en un modal
   */
  showPdfInModal(folioFormato: string, content?: any): void {
    this.isLoading = true;

    this.outsService.generateEntregaPDF(folioFormato).subscribe({
      next: (blob: Blob) => {
        this.isLoading = false;

        // Crear URL del blob
        const blobUrl = URL.createObjectURL(blob);

        // Sanitizar URL para usar en iframe
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);

        // Configurar título
        this.pdfTitle = `Formato de Entrega ${folioFormato}`;

        // Si se proporcionó un elemento de contenido, abrir en ese modal
        if (content) {
          this.openPdfModal(content);
        } else {
          // Fallback: abrir en nueva ventana
          window.open(blobUrl, '_blank');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.alertService.warning('Error al generar el PDF');
        console.error('Error al generar el PDF:', error);
      },
    });
  }

  /**
   * Abre el modal con el PDF
   */
  private openPdfModal(content: any): void {
    const modalRef = this.modalService.open(content, {
      size: 'lg',
      centered: true,
      scrollable: true,
      backdrop: 'static',
    });

    // Limpiar recursos cuando se cierre el modal
    modalRef.result.then(
      () => this.cleanupPdfResources(),
      () => this.cleanupPdfResources()
    );
  }

  /**
   * Limpia los recursos del PDF
   */
  private cleanupPdfResources(): void {
    if (this.pdfSrc) {
      const url = this.pdfSrc.toString();
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      this.pdfSrc = null;
    }
  }

  /**
   * Descarga el PDF actual
   */
  downloadPdf(): void {
    if (!this.pdfSrc) return;

    try {
      // Extraer el folio de formato del título
      const folioFormato = this.pdfTitle
        .replace('Formato de Entrega ', '')
        .trim();

      this.isLoading = true;
      this.outsService.generateEntregaPDF(folioFormato).subscribe({
        next: (blob: Blob) => {
          this.isLoading = false;

          // Crear una URL para el nuevo blob
          const url = window.URL.createObjectURL(blob);

          // Crear un elemento <a> para descargar
          const link = document.createElement('a');
          link.href = url;
          link.download = `Formato_Entrega_${folioFormato.replace(
            /[^a-zA-Z0-9]/g,
            '_'
          )}.pdf`;
          document.body.appendChild(link);

          // Simular clic y luego eliminar el elemento
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);
        },
        error: (error) => {
          this.isLoading = false;
          this.alertService.warning('Error al descargar el PDF');
          console.error('Error al descargar el PDF:', error);
        },
      });
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      this.alertService.warning('Error al descargar el PDF');
    }
  }
}
