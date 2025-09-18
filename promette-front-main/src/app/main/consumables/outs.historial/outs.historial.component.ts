import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { Subject, of, Subscription, forkJoin } from 'rxjs';
import { takeUntil, catchError, retry, map } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {
  NgxDatatableModule,
  ColumnMode,
  SelectionType,
  DatatableComponent,
  SortType,
} from '@swimlane/ngx-datatable';

import { CoreModalService } from '../../../core/services/core.modal.service';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import {
  OutsHistorialService,
  DocumentUploadResponse,
  DocumentCheckResponse,
} from './services/outs.historial.service';
import { FormComponent } from '../outs/form/form.component';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';

import {
  SalidaHistorial,
  EntregaFormato,
  FiltrosHistorial,
} from './interfaces/historial.interface';

import { TutorialComponent } from '../../../shared/tutorial/tutorial.component';
import { TutorialConfig } from '../../../core/services/tutorial.service';
import { AreasService, Area } from '../outs/services/areas.service';

@Component({
  selector: 'app-outs-historial',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InputTextModule,
    NgxDatatableModule,
    SharedCustomModalComponent,
    TutorialComponent,
  ],
  templateUrl: './outs.historial.component.html',
  styleUrls: ['./outs.historial.component.scss'],
})
export class OutsHistorialComponent implements OnInit, OnDestroy {
  // Referencias a elementos DOM
  @ViewChild('historialTable') table!: DatatableComponent;
  @ViewChild('pdfModal') pdfModal!: ElementRef;

  //* Configuración del tutorial
  tutorialConfig: TutorialConfig = {
    steps: [
      {
        title: 'Barra de busqueda',
        element: '#buscador',
        intro: 'Busca los formatos enviados.',
        position: 'right',
      },
      {
        title: 'Ordenar',
        element: '#orden',
        intro: 'Ordena los registros de la tabla.',
        position: 'left',
      },
      {
        title: 'Tabla de folios',
        element: '#taba-folios',
        intro: 'Muestra todos los folios registrados.',
        position: 'left',
      },
      {
        title: 'Ver PDF',
        element: '#pdf',
        intro: 'Muestra el documento PDF del registro selecionado.',
        position: 'left',
      },
      {
        title: 'Subir documento',
        element: '#subir',
        intro: 'Permite subir un documento para el registro seleccionado.',
        position: 'left',
      },
      {
        title: 'Ver documento',
        element: '#ver',
        intro:
          'PErmite ver el documento cargado para el registro seleccionado.',
        position: 'left',
      },
      {
        title: 'Actualizar documento',
        element: '#actualizar',
        intro:
          'Permite actualizar el documento cargado para el registro seleccionado.',
        position: 'left',
      },
      {
        title: 'Resgistros por página',
        element: '#por-pagina',
        intro: 'Muestra el número de registros por página.',
        position: 'right',
      },
    ],
    onComplete: () => {
      console.log('Tutorial completado en unidades');
    },
    onExit: () => {
      console.log('Tutorial cerrado en unidades');
    },
  };
  private destroy$ = new Subject<void>();

  // Datos de formatos de entrega
  formatosEntrega: EntregaFormato[] = [];
  filteredFormatos: EntregaFormato[] = [];
  selected: EntregaFormato[] = [];

  // Propiedades para manejo de PDF
  pdfSrc: SafeResourceUrl | null = null;
  pdfTitle: string = 'Formato de Entrega';

  // Referencias a enumeraciones y objetos globales
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  Math = Math;

  // Filtrado de datos
  searchText: string = '';
  filtros: FiltrosHistorial = {};

  // Estado de carga
  loading: boolean = false;

  // Configuración de ordenamiento
  sortColumn: string = 'createdAt';
  isAscending: boolean = false;
  currentSorts: { prop: string; dir: string }[] = [
    { prop: 'createdAt', dir: 'desc' },
  ];

  // Configuración de paginación
  limit = 10;
  limits: number[] = [5, 10, 25, 50, 100];
  offset = 0;

  // Registro de formatos que tienen documentos adjuntos
  formatsWithDocuments: { [key: string]: boolean } = {};

  // Suscripción para eventos de cambio de página
  private pageChangeSubscription: Subscription | null = null;

  // Cache de áreas para evitar múltiples llamadas a la API
  private areasCache: Map<number, string> = new Map();
  private areasLoaded: boolean = false;

  constructor(
    private historialService: OutsHistorialService,
    private alertService: CoreAlertService,
    private modalService2: NgbModal,
    private sanitizer: DomSanitizer,
    private areasService: AreasService
  ) {}

  ngOnInit(): void {
    // Recuperar configuración guardada de paginación
    const savedLimit = localStorage.getItem('historialPageLimit');
    if (savedLimit) {
      this.limit = parseInt(savedLimit, 10);
    }

    this.loadAreas();
  }

  ngAfterViewInit() {
    // Ajustar la tabla después de que se carga la vista
    setTimeout(() => {
      if (this.table) {
        this.table.recalculate();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    // Limpieza de recursos al destruir el componente
    this.destroy$.next();
    this.destroy$.complete();

    if (this.pageChangeSubscription) {
      this.pageChangeSubscription.unsubscribe();
    }
  }

  /**
   * Carga todas las áreas disponibles y las almacena en cache
   */
  loadAreas(): void {
    if (this.areasLoaded) {
      this.loadFormatosEntrega();
      return;
    }

    this.areasService
      .getAllAreas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (areas: Area[]) => {
          // Crear cache de áreas para acceso rápido
          areas.forEach((area) => {
            this.areasCache.set(area.id_area, area.nombre);
          });
          this.areasLoaded = true;
          console.log('Áreas cargadas:', this.areasCache.size);

          // Después de cargar las áreas, cargar los formatos
          this.loadFormatosEntrega();
        },
        error: (error) => {
          console.error('Error al cargar áreas:', error);
          this.alertService.info('Áreas no disponibles');
          // Cargar formatos aunque falle la carga de áreas
          this.loadFormatosEntrega();
        },
      });
  }

  /**
   * Extrae el ID del área desde el texto "Área ID: X"
   */
  private extractAreaId(departamentoNombre: string): number | null {
    const match = departamentoNombre.match(/Área ID: (\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Resuelve el nombre del área basado en el ID
   */
  private resolveAreaName(departamentoNombre: string): string {
    if (!departamentoNombre || !departamentoNombre.includes('Área ID:')) {
      return departamentoNombre || 'No especificado';
    }

    const areaId = this.extractAreaId(departamentoNombre);
    if (areaId && this.areasCache.has(areaId)) {
      return this.areasCache.get(areaId)!;
    }

    return departamentoNombre; // Si no se puede resolver, mantener el original
  }

  /**
   * Carga los formatos de entrega desde el servicio
   */
  loadFormatosEntrega(): void {
    this.loading = true;

    this.historialService
      .getFormatosEntrega(this.filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          let formatos: EntregaFormato[] = [];
          if (response && typeof response === 'object') {
            if (response.formatos && Array.isArray(response.formatos)) {
              formatos = response.formatos;
            } else if (Array.isArray(response)) {
              formatos = response;
            } else {
              formatos =
                response.formatosEntrega ||
                response.data ||
                response.entregas ||
                response.entregas_formatos ||
                [];
            }
          }
          this.formatosEntrega = formatos;
          if (!this.formatosEntrega || !this.formatosEntrega.length) {
            this.filteredFormatos = [];
            this.loading = false;
            return;
          }

          // Procesamiento de datos con resolución de nombres de áreas
          this.filteredFormatos = this.formatosEntrega.map((formato) => {
            const formatoCopy = { ...formato };

            // Resolver el nombre del área usando el cache
            formatoCopy.departamento_nombre = this.resolveAreaName(
              formato.departamento_nombre || 'No especificado'
            );

            // Para usuario, mantener la misma lógica
            formatoCopy.usuario_nombre =
              formato.usuario_nombre ||
              formato.ct_usuario?.nombre_usuario ||
              'No especificado';

            formatoCopy.persona_recibe =
              formato.persona_recibe || 'No especificado';

            if (typeof formatoCopy.cantidadTotal !== 'number') {
              formatoCopy.cantidadTotal = 0;
            }

            if (!formatoCopy.folio_formato && formatoCopy.id_formato) {
              formatoCopy.folio_formato = `FORMAT-${formatoCopy.id_formato}`;
            }

            return formatoCopy;
          });

          this.sortColumn = 'createdAt';
          this.isAscending = false;
          this.applySorting();

          this.loading = false;

          // Cargar estado de documentos
          this.loadDocumentosStatus();
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al cargar formatos:', err);
          this.alertService.error('Error al cargar historial de entregas');
        },
      });
  }

  /**
   * Maneja el cambio de página en la tabla
   */
  setPage(event: any): void {
    this.offset = event.offset;
    setTimeout(() => {
      if (this.table) {
        this.table.recalculate();
      }
    }, 0);
  }

  /**
   * Valida que el offset de página sea válido para los datos actuales
   */
  private validatePageOffset(): void {
    const totalPages = Math.ceil(this.filteredFormatos.length / this.limit);
    if (totalPages > 0 && this.offset >= totalPages) {
      this.offset = totalPages - 1;
      if (this.table) {
        this.table.offset = this.offset;
      }
    }
  }

  /**
   * Maneja el cambio en la cantidad de elementos por página
   */
  onLimitChange(): void {
    this.offset = 0;
    const totalPages = Math.ceil(this.filteredFormatos.length / this.limit);

    if (this.table) {
      this.table.offset = 0;
      this.table.limit = this.limit;
      this.table.recalculate();
    }
    localStorage.setItem('historialPageLimit', this.limit.toString());
  }

  /**
   * Filtra los datos según el texto de búsqueda ingresado
   */
  onFilterTextBoxChanged(): void {
    if (!this.searchText) {
      this.filteredFormatos = [...this.formatosEntrega];
    } else {
      const searchLower = this.searchText.toLowerCase();
      this.filteredFormatos = this.formatosEntrega.filter(
        (item) =>
          (item.folio_formato &&
            item.folio_formato.toLowerCase().includes(searchLower)) ||
          (item.departamento_nombre &&
            item.departamento_nombre.toLowerCase().includes(searchLower)) ||
          (item.usuario_nombre &&
            item.usuario_nombre.toLowerCase().includes(searchLower)) ||
          (item.persona_recibe &&
            item.persona_recibe.toLowerCase().includes(searchLower)) ||
          (item.createdAt &&
            new Date(item.createdAt)
              .toLocaleDateString('es-MX')
              .includes(searchLower))
      );
    }
    this.applySorting();
    this.offset = 0;
    if (this.table) {
      this.table.offset = 0;
    }

    this.validatePageOffset();

    setTimeout(() => {
      if (this.table) {
        this.table.recalculate();
      }
    }, 0);
  }

  /**
   * Maneja la selección de filas en la tabla
   */
  onSelect(event: any): void {
    this.selected = event.selected;
  }

  /**
   * Aplica cambios en el ordenamiento de datos
   */
  onSortChange(): void {
    this.currentSorts = [
      { prop: this.sortColumn, dir: this.isAscending ? 'asc' : 'desc' },
    ];
    this.applySorting();
  }

  /**
   * Cambia la dirección del ordenamiento (ascendente/descendente)
   */
  toggleSortDirection(): void {
    this.isAscending = !this.isAscending;
    this.onSortChange();
  }

  /**
   * Ordena los datos según la configuración actual
   */
  applySorting(): void {
    const dir = this.isAscending ? 1 : -1;

    this.filteredFormatos.sort((a: EntregaFormato, b: EntregaFormato) => {
      const propA = a[this.sortColumn as keyof EntregaFormato];
      const propB = b[this.sortColumn as keyof EntregaFormato];

      // Manejar propiedades numéricas
      if (this.sortColumn === 'cantidadTotal') {
        return (Number(propA) - Number(propB)) * dir;
      }

      // Manejar fechas
      if (this.sortColumn === 'createdAt') {
        return (
          (new Date(propA as string).getTime() -
            new Date(propB as string).getTime()) *
          dir
        );
      }

      // Manejar propiedades string
      if (propA === undefined && propB === undefined) return 0;
      if (propA === undefined) return 1 * dir;
      if (propB === undefined) return -1 * dir;

      // Manejo seguro de nulos
      const safeA = propA ?? '';
      const safeB = propB ?? '';

      if (safeA < safeB) return -1 * dir;
      if (safeA > safeB) return 1 * dir;
      return 0;
    });

    // Forzar actualización de la vista
    this.filteredFormatos = [...this.filteredFormatos];
  }

  /**
   * Maneja el evento de ordenamiento de la tabla
   */
  onTableSort(event: any): void {
    this.sortColumn = event.sorts[0].prop;
    this.isAscending = event.sorts[0].dir === 'asc';
    this.currentSorts = event.sorts;
  }

  /**
   * Muestra los detalles de un formato abriendo su PDF
   */
  viewDetails(formato: EntregaFormato): void {
    const folioFormato = formato.folio_formato;
    if (folioFormato) {
      this.generarPdf(folioFormato);
    } else {
      this.alertService.warning('No se encontró el folio del formato');
    }
  }

  /**
   * Genera el PDF de un formato de entrega y lo muestra en un modal
   */
  generarPdf(folioFormato: string): void {
    try {
      this.loading = true;

      this.historialService.generateEntregaPDF(folioFormato).subscribe({
        next: (blob: Blob) => {
          this.loading = false;
          const blobUrl = URL.createObjectURL(blob);
          this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
          this.pdfTitle = `Formato de Entrega ${folioFormato}`;

          if (this.pdfModal) {
            this.openPdfModal(this.pdfModal);
          } else {
            window.open(blobUrl, '_blank');
          }
        },
        error: (error) => {
          this.loading = false;
          this.alertService.warning('Error al generar el PDF');
        },
      });
    } catch (error) {
      this.loading = false;
      this.alertService.warning('Hubo un problema al generar el PDF');
    }
  }

  /**
   * Abre el modal para mostrar el PDF
   */
  openPdfModal(content: any) {
    this.modalService2.open(content, {
      size: 'lg',
      centered: true,
      scrollable: true,
      backdrop: 'static',
    });
  }

  /**
   * Limpia recursos al cerrar el modal de PDF
   */
  onModalClose() {
    if (this.pdfSrc) {
      const blobUrl = this.pdfSrc.toString();
      if (blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
      this.pdfSrc = null;
    }
  }

  /**
   * Descarga el PDF que se está visualizando actualmente
   */
  downloadCurrentPdf() {
    if (!this.pdfSrc) return;

    try {
      const folioFormato = this.pdfTitle
        .replace('Formato de Entrega ', '')
        .trim();

      this.loading = true;
      this.historialService.generateEntregaPDF(folioFormato).subscribe({
        next: (blob: Blob) => {
          this.loading = false;
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Formato_Entrega_${folioFormato.replace(
            /[^a-zA-Z0-9]/g,
            '_'
          )}.pdf`;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);
        },
        error: (error) => {
          this.loading = false;
          this.alertService.warning('Error al descargar el PDF');
        },
      });
    } catch (error) {
      this.alertService.warning('Error al descargar el PDF');
    }
  }

  /**
   * Muestra un modal de error con el mensaje especificado
   */
  private showErrorModal(message: string): void {
    this.alertService.error(message);
  }

  /**
   * Maneja acciones de botones en filas
   */
  handleAction(action: string, formato: EntregaFormato): void {
    if (action === 'view') {
      this.viewDetails(formato);
    }
  }

  /**
   * Verifica si un formato tiene un documento adjunto
   */
  hasDocument(formatoId: string): boolean {
    return !!this.formatsWithDocuments[formatoId];
  }

  /**
   * Maneja la acción de subir un documento para un formato
   */
  handleUploadDocument(formato: EntregaFormato, event: Event): void {
    event.stopPropagation();

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.jpg,.jpeg,.png';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    fileInput.click();

    fileInput.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];

        const acceptedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
        ];
        if (!acceptedTypes.includes(file.type)) {
          this.alertService.error(
            'Tipo de archivo no válido. Solo se aceptan PDF e imágenes.'
          );
          document.body.removeChild(fileInput);
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          this.alertService.error(
            'El archivo es demasiado grande. El tamaño máximo es 5MB.'
          );
          document.body.removeChild(fileInput);
          return;
        }

        this.loading = true;

        this.historialService
          .uploadFormatoDocument(formato.folio_formato || '', file)
          .subscribe({
            next: (response: DocumentUploadResponse) => {
              this.loading = false;
              if (response.success) {
                this.formatsWithDocuments[formato.folio_formato || ''] = true;
                this.alertService.success('Documento subido correctamente');
              } else {
                this.alertService.error(
                  response.message || 'Error al subir el documento'
                );
              }
            },
            error: () => {
              this.loading = false;
              this.alertService.error('Error al subir el documento');
            },
          });
      }
      document.body.removeChild(fileInput);
    });
  }

  /**
   * Maneja la acción de actualizar un documento existente
   */
  handleUpdateDocument(formato: EntregaFormato, event: Event): void {
    event.stopPropagation();

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.jpg,.jpeg,.png';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    fileInput.click();

    fileInput.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];

        const acceptedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
        ];
        if (!acceptedTypes.includes(file.type)) {
          this.alertService.error(
            'Tipo de archivo no válido. Solo se aceptan PDF e imágenes.'
          );
          document.body.removeChild(fileInput);
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          this.alertService.error(
            'El archivo es demasiado grande. El tamaño máximo es 5MB.'
          );
          document.body.removeChild(fileInput);
          return;
        }

        this.loading = true;

        this.historialService
          .uploadFormatoDocument(formato.folio_formato || '', file)
          .subscribe({
            next: (response: DocumentUploadResponse) => {
              this.loading = false;
              if (response.success) {
                this.alertService.success(
                  'Documento actualizado correctamente'
                );
              } else {
                this.alertService.error(
                  response.message || 'Error al actualizar el documento'
                );
              }
            },
            error: () => {
              this.loading = false;
              this.alertService.error('Error al actualizar el documento');
            },
          });
      }
      document.body.removeChild(fileInput);
    });
  }

  /**
   * Maneja la acción de visualizar un documento adjunto
   */
  handleViewDocument(formato: EntregaFormato, event: Event): void {
    event.stopPropagation();

    if (!formato.folio_formato) {
      this.alertService.warning('No se encontró el folio del formato');
      return;
    }

    this.loading = true;

    this.historialService.getFormatoDocument(formato.folio_formato).subscribe({
      next: (blob: Blob) => {
        this.loading = false;
        const blobUrl = URL.createObjectURL(blob);
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
        this.pdfTitle = `Documento del formato ${formato.folio_formato}`;

        if (this.pdfModal) {
          this.openPdfModal(this.pdfModal);
        } else {
          window.open(blobUrl, '_blank');
        }
      },
      error: (error) => {
        this.loading = false;
        this.alertService.error('Error al obtener el documento');
      },
    });
  }

  /**
   * Carga el estado de los documentos para los formatos visibles
   */
  loadDocumentosStatus(): void {
    if (this.formatosEntrega.length === 0) return;

    // Limitar la verificación solo a formatos visibles en la página actual
    const startIndex = this.offset * this.limit;
    const endIndex = Math.min(
      startIndex + this.limit,
      this.formatosEntrega.length
    );
    const formatosVisibles = this.formatosEntrega.slice(startIndex, endIndex);

    formatosVisibles.forEach((formato) => {
      if (formato.folio_formato) {
        this.historialService
          .checkFormatoDocument(formato.folio_formato)
          .pipe(
            retry(1),
            catchError((err) => {
              return of({
                success: false,
                hasDocument: false,
                folio_formato: formato.folio_formato,
              });
            })
          )
          .subscribe({
            next: (resp) => {
              if (resp.success && resp.hasDocument) {
                this.formatsWithDocuments[resp.folio_formato] = true;
              }
            },
          });
      }
    });

    // Configurar listener para eventos de paginación
    if (this.table) {
      if (this.pageChangeSubscription) {
        this.pageChangeSubscription.unsubscribe();
      }

      this.pageChangeSubscription = this.table.page
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          setTimeout(() => this.loadDocumentosStatus(), 100);
        });
    }
  }

  /**
   * Formatea una fecha a formato localizado español
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  }

  /**
   * Obtiene un resumen de las observaciones de todas las entregas de un formato
   * @param formato El formato de entrega
   * @returns String con las observaciones resumidas
   */
  getObservacionesSummary(formato: EntregaFormato): string {
    if (
      !formato['dt_consumible_entrega'] ||
      formato['dt_consumible_entrega'].length === 0
    ) {
      return 'Sin observaciones';
    }

    // Obtener todas las observaciones no vacías
    const observaciones: string[] = [];
    formato['dt_consumible_entrega'].forEach((entrega: any) => {
      if (
        entrega.observaciones &&
        typeof entrega.observaciones === 'string' &&
        entrega.observaciones.trim().length > 0
      ) {
        observaciones.push(entrega.observaciones);
      }
    });

    if (observaciones.length === 0) {
      return 'Sin observaciones';
    }

    // Si hay una sola observación, devolverla
    if (observaciones.length === 1) {
      return observaciones[0];
    }

    // Si hay múltiples observaciones, crear un resumen
    const uniqueObservaciones = [...new Set(observaciones)]; // Eliminar duplicados

    if (uniqueObservaciones.length === 1) {
      return uniqueObservaciones[0];
    }

    // Devolver un resumen indicando múltiples observaciones
    return `${uniqueObservaciones.length} observaciones diferentes`;
  }
}
