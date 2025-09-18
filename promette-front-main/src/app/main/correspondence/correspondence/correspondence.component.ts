import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  signal,
  effect,
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { SharedBreadCrumbComponent } from '../../../shared/shared-bread-crumb/shared-bread-crumb.component';
import { FormSelectsComponent } from './components/form-selects/form-selects.component';
import { CorrespondenceAddFormComponent } from './components/form/form.component';
import { CorrespondenceService } from './services/correspondence.service';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';
import { filter, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';

@Component({
  selector: 'correspondence-component',
  standalone: true,
  imports: [
    AgGridAngular,
    CommonModule,
    SharedCustomModalComponent,
    FormSelectsComponent,
    ToastModule,
    AvatarModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [MessageService],
  templateUrl: './correspondence.component.html',
  styleUrl: './correspondence.component.scss',
})
export class CorrespondenceComponent implements OnInit {
  private userSelector = injectSelector<RootState, any>((state) => state.auth);
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  clickCount = 0;
  constructor(
    private modalService: CoreModalService,
    private correspondenceService: CorrespondenceService,
    private alertService: CoreAlertService,
    private sanitizer: DomSanitizer,
    private router: Router,
    public messageService: MessageService // <-- Cambia a public
  ) {
    effect(() => {
      const userData = this.userSelector();
      if (userData) {
        this.currentUserSubject.next(userData);
        this.aplicarFiltros(userData);
      } else {
        // console.log('usuario aún no disponible');
      }
    });
  }

  rowData: any[] = []; //Contiene los registros de correspondencia
  filtrosActuales: any = {}; //Guarda los filtros aplicados

  // Propiedades para el selector de Excel
  excelType: string = '';
  startDate: string = '';
  endDate: string = '';
  isGenerating: boolean = false;

  public myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });
  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 25, 50];

  public columnDefs: ColDef[] = [
    {
      field: 'folio_sistema',
      headerName: 'Folio',
      width: 90,
    },
    {
      field: 'fecha_correspondencia',
      headerName: 'Fecha de Correspondencia',
      flex: 1,
    },
    {
      field: 'resumen_correspondencia',
      headerName: 'Resumen',
      flex: 1,
    },
    {
      field: 'ruta_correspondencia',
      headerName: 'Documento',
      flex: 1,
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        // Extraer solo el nombre del archivo si viene una ruta
        const folio = params.value.split('/').pop();
        return `<div style="display: flex; align-items: center; justify-content: center; height: 100%;">
          <button title="Ver PDF" type="button" class="btn btn-sm btn-outline-info mx-1" onclick="window.angularComponentRef.openCorrespondencePdf && window.angularComponentRef.openCorrespondencePdf('${folio}')">
            <i class="bi bi-eye-fill"></i>
          </button>
        </div>`;
      },
      maxWidth: 120,
    },
    {
      // Se usa para vincular la tabla con el servicio de correspondencia
      field: 'folio_correspondencia',
      //Se usa para mostrar el nombre de la columna
      headerName: 'Folio de Correspondencia',
      flex: 1,
    },
    {
      field: 'nombre_prioridad',
      headerName: 'Prioridad',
      flex: 1,
    },
    {
      field: 'nombre_entrega',
      headerName: 'Forma de Entrega',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: any) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'center';

        // Botón ÚNICO para Observaciones
        const btnStatus = document.createElement('button');
        btnStatus.innerHTML = `<i class="bi bi-card-checklist"></i>`; // <-- Icono para las acciones en la tabla
        btnStatus.classList.add('btn', 'btn-sm', 'btn-primary');
        btnStatus.title = 'Observaciones';
        btnStatus.addEventListener('click', () =>
          params.context.componentParent.changeStatus(params.data)
        );

        div.appendChild(btnStatus);

        return div;
      },
      cellRendererParams: {
        context: {
          componentParent: this,
        },
      },
      flex: 1,
      maxWidth: 180,
    },
    // Botón para descargar acuse
    {
      headerName: 'Acuse',
      cellStyle: { textAlign: 'center' },
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: {
        onPDF: this.onPDFCorrespondence.bind(this), // Solo el handler para PDF
      },
      flex: 1,
      maxWidth: 120,
      filter: false,
    },
    {
      headerName: 'Editar',
      cellStyle: { textAlign: 'center' },
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: {
        onEditFull: this.editFull.bind(this),
      },
      flex: 1,
      maxWidth: 100,
      filter: false,
    },
  ];

  public gridOptions = {
    defaultColDef: {
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
    },
  };

  @ViewChild('pdfModal') pdfModal!: ElementRef;
  pdfSrc: SafeResourceUrl | null = null;
  pdfTitle: string = 'Documento de correspondencia';

  ngOnInit() {
    this.setResponsiveColumns();
    // La carga inicial de datos ahora se maneja en el `effect` del constructor.
    // Escuchar el evento global para abrir visor PDF
    window.addEventListener('open-pdf-viewer', (event: any) => {
      if (event && event.detail) {
        this.openPdfViewer(event.detail);
      }
    });

    // Exponer la función al window para el cellRenderer
    (window as any).angularComponentRef = {
      openCorrespondencePdf: (folio: string) =>
        this.openCorrespondencePdf(folio),
    };
  }
  setResponsiveColumns(): void {
    const w = window.innerWidth;
    if (w <= 768) {
      let mobileBase = Math.floor(w / 3) - 9;
      if (mobileBase < 100) mobileBase = 100;
      this.columnDefs = [
        { field: 'folio_sistema', headerName: 'Folio', minWidth: mobileBase },
        {
          field: 'fecha_correspondencia',
          headerName: 'Fecha',
          minWidth: mobileBase,
        },
        {
          field: 'resumen_correspondencia',
          headerName: 'Resumen',
          minWidth: mobileBase,
        },
        // El resto de columnas con mayor ancho para scroll
        {
          field: 'ruta_correspondencia',
          headerName: 'Documento',
          minWidth: mobileBase + 40,
        },
        {
          field: 'folio_correspondencia',
          headerName: 'Folio de Correspondencia',
          minWidth: mobileBase + 40,
        },
        {
          field: 'nombre_prioridad',
          headerName: 'Prioridad',
          minWidth: mobileBase + 40,
        },
        {
          field: 'nombre_entrega',
          headerName: 'Entrega',
          minWidth: mobileBase + 40,
        },
      ];
    } else {
      // ...existing code for desktop/tablet columnDefs...
    }
  }
  aplicarFiltros(filtros: any) {
    const id_usuario = this.currentUserSubject.value?.user?.id_usuario;
    if (id_usuario) {
      this.filtrosActuales = { ...filtros, id_usuario };
      this.loadCorrespondenceData(this.filtrosActuales);
    }
  }

  // Método para cargar los datos de correspondencia el arr.map sivera para recorrer los arreglos y agregar los nombres de prioridad y entrega
  loadCorrespondenceData(filtros?: any) {
    const flatten = (arr: any[]) =>
      arr.map((item) => ({
        ...item,
        nombre_prioridad:
          item.ct_clasificacion_prioridad?.nombre_prioridad || '',
        nombre_entrega: item.ct_forma_entrega?.nombre_entrega || '',
      }));

    // Siempre incluir id_usuario en los filtros para que al agregar una correspondencia, no se muestre las correspondencias que no son del usuario actual
    const id_usuario = this.currentUserSubject.value?.user?.id_usuario;
    const filtrosConUsuario = { ...(filtros || {}), id_usuario };
    this.correspondenceService
      .filterCorrespondences(filtrosConUsuario)
      .subscribe({
        next: (data: any) => {
          const raw = data.data || data || [];
          this.rowData = Array.isArray(raw) ? flatten(raw) : [];
        },
        error: (error) => {
          // console.log('Error al cargar los datos: ' + JSON.stringify(error));
          // console.error('Error al cargar los datos:', error);
        },
      });
  }

  edit(row: any) {
    this.modalService.close(); // Cierra cualquier modal abierto antes de abrir uno nuevo
    this.modalService.open(
      CorrespondenceAddFormComponent,
      'Observaciones de la correspondencia',
      {
        data: {
          mode: 'status',
          correspondencia: row,
          onSave: () => {
            // Siempre recargar con id_usuario
            const id_usuario = this.currentUserSubject.value?.user?.id_usuario;
            this.loadCorrespondenceData({ id_usuario });
          },
          id_usuario: this.currentUserSubject.value.user.id_usuario,
        },
      }
    );
  }

  editFull(row: any) {
    this.modalService.close();
    this.modalService.open(
      CorrespondenceAddFormComponent,
      'Editar correspondencia',
      {
        data: {
          mode: 'editFull', // Cambiado de 'edit' a 'editFull'
          correspondencia: row,
          onSave: () => {
            const id_usuario = this.currentUserSubject.value?.user?.id_usuario;
            this.loadCorrespondenceData({ id_usuario });
          },
          id_usuario: this.currentUserSubject.value.user.id_usuario,
        },
      }
    );
  }

  add() {
    this.modalService.close();
    this.modalService.open(
      CorrespondenceAddFormComponent,
      'Agregar correspondencia',
      {
        data: {
          mode: 'add',
          onSave: () => {
            // Siempre recargar con id_usuario
            const id_usuario = this.currentUserSubject.value?.user?.id_usuario;
            this.loadCorrespondenceData({ id_usuario });
          },
        },
        id_usuario: this.currentUserSubject.value.user.id_usuario,
      }
    );
  }
  changeStatus(row: any) {
    this.modalService.close();
    const id_correspondencia = row.id_correspondencia;
    const id_usuario = this.currentUserSubject.value?.user?.id_usuario;

    if (!id_usuario || !id_correspondencia) {
      console.error('❌ Error: Faltan datos requeridos');
      console.error('- id_usuario válido?', !!id_usuario);
      console.error('- id_correspondencia válido?', !!id_correspondencia);
      alert('No se pudo obtener el usuario o la correspondencia.');
      return;
    }
    // Extraer id_correspondencia_usuario desde rl_correspondencia_usuario_estado
    let id_correspondencia_usuario = null;
    if (
      row.rl_correspondencia_usuario_estado &&
      row.rl_correspondencia_usuario_estado.id_correspondencia_usuario
    ) {
      id_correspondencia_usuario =
        row.rl_correspondencia_usuario_estado.id_correspondencia_usuario;
    }
    // Si no se encuentra, intenta buscar en rl_correspondencia_usuario_estados por compatibilidad
    if (
      !id_correspondencia_usuario &&
      Array.isArray(row.rl_correspondencia_usuario_estados)
    ) {
      // Busca el registro que corresponde al usuario actual
      const match = row.rl_correspondencia_usuario_estados.find(
        (r: any) => r.ct_usuarios_in === id_usuario
      );
      id_correspondencia_usuario = match?.id_correspondencia_usuario;
    }
    // Abre el modal solo si se encontró el id_correspondencia_usuario
    if (id_correspondencia_usuario) {
      this.modalService.open(
        CorrespondenceAddFormComponent,
        'Editar correspondencia',
        {
          data: {
            mode: 'status',
            correspondencia: {
              ...row,
              id_correspondencia_usuario,
            },
            onSave: () => {
              // Siempre recargar con id_usuario
              const id_usuario =
                this.currentUserSubject.value?.user?.id_usuario;
              this.loadCorrespondenceData({ id_usuario });
            },
            id_usuario: this.currentUserSubject.value.user.id_usuario, // <-- Se agrega aquí
          },
        }
      );
    } else {
      this.alertService.error(
        'No se encontró el identificador de correspondencia de usuario para este registro.'
      );
    }
  }

  // Método para abrir el visor PDF, reutilizando el shared modal
  openPdfViewer(pdfUrl: string) {
    this.modalService.close();
    this.modalService.open(
      undefined,
      'Visualización de PDF',
      undefined,
      undefined,
      pdfUrl
    );
  }

  // Método para abrir PDF de correspondencia en el modal reutilizable usando el nuevo endpoint seguro
  openCorrespondencePdf(rutaArchivo: string) {
    if (!rutaArchivo) {
      this.alertService.error(
        'No hay archivo de correspondencia para mostrar.'
      );
      return;
    }
    // Extraer solo el nombre del archivo si viene una ruta
    const nombreArchivo = rutaArchivo.split('/').pop() || rutaArchivo;
    this.correspondenceService
      .getCorrespondenceDocument(nombreArchivo)
      .subscribe({
        next: (blob: Blob) => {
          const blobUrl = URL.createObjectURL(blob);
          // El modal lo sanitiza con el pipe safeUrl
          this.modalService.open(
            undefined,
            `Documento de correspondencia ${nombreArchivo}`,
            undefined,
            undefined,
            blobUrl
          );
        },
        error: () => {
          this.alertService.error(
            'No se pudo obtener el PDF de correspondencia.'
          );
        },
      });
  }

  openPdfModal(content: any) {
    this.modalService.open(content, this.pdfTitle, undefined, undefined);
  }

  onModalClose() {
    if (this.pdfSrc) {
      const blobUrl = this.pdfSrc.toString();
      if (blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
      this.pdfSrc = null;
    }
  }

  downloadCurrentPdf() {
    if (!this.pdfSrc) return;
    try {
      const folio = this.pdfTitle
        .replace('Documento de correspondencia', '')
        .trim();
      this.correspondenceService.getCorrespondenceDocument(folio).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Correspondencia_${folio.replace(
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
          this.alertService.error('Error al descargar el PDF');
        },
      });
    } catch (error) {
      this.alertService.error('Error al descargar el PDF');
    }
  }
  //Método para descargar el archivo Excel de correspondencia, botón que esta fuera de la tabla
  exportToExcel(): void {
    this.correspondenceService.exportToExcel().subscribe({
      next: (response: any) => {
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, 'correspondencia.xlsx');
        this.alertService.success('Excel generado correctamente');
      },
      error: (error) => {
        // console.error('Error al exportar a Excel:', error);
        this.alertService.error('Error al generar el archivo Excel');
      },
    });
  }

  // Métodos para el nuevo selector de Excel
  onExcelTypeChange(): void {
    // Limpiar fechas cuando cambia el tipo
    this.startDate = '';
    this.endDate = '';
  }

  canShowGenerateButton(): boolean {
    return this.excelType !== '';
  }
  canGenerate(): boolean {
    if (!this.excelType) return false;

    if (this.excelType === 'byDates') {
      return this.startDate !== '' && this.endDate !== '';
    }

    if (this.excelType === 'monthly') {
      return true; // No requiere fechas, se genera del mes actual
    }

    return false;
  }
  generateExcel(): void {
    if (!this.canGenerate() || this.isGenerating) return;

    this.isGenerating = true;

    if (this.excelType === 'byDates') {
      this.exportExcelByDates();
    } else if (this.excelType === 'monthly') {
      this.exportMonthlyExcel();
    }
  }

  private exportExcelByDates(): void {
    this.correspondenceService
      .exportExcelByDates(this.startDate, this.endDate)
      .subscribe({
        next: (response: any) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const fileName = `correspondencia_${this.startDate}_${this.endDate}.xlsx`;
          saveAs(blob, fileName);
          this.alertService.success('Excel diario generado correctamente');
          this.resetExcelForm();
        },
        error: (error) => {
          this.alertService.error('Error al generar el archivo Excel diario');
          this.isGenerating = false;
        },
      });
  }
  private exportMonthlyExcel(): void {
    this.correspondenceService.exportExcelMonthly().subscribe({
      next: (response: any) => {
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = (hoy.getMonth() + 1).toString().padStart(2, '0');
        const fileName = `correspondencia_mensual_${year}_${month}.xlsx`;
        saveAs(blob, fileName);
        this.alertService.success('Excel mensual generado correctamente');
        this.resetExcelForm();
      },
      error: (error) => {
        this.alertService.error('Error al generar el archivo Excel mensual');
        this.isGenerating = false;
      },
    });
  }

  private resetExcelForm(): void {
    this.excelType = '';
    this.startDate = '';
    this.endDate = '';
    this.isGenerating = false;
  }
  // Método para descargar el Acuse, icono verde en la tabla
  excelCorrespondence(row: any): void {
    const id = row.id_correspondencia;
    if (!id) {
      this.alertService.error(
        'No se encontró el identificador de correspondencia.'
      );
      return;
    }
    this.correspondenceService.downloadCorrespondencePdf(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Acuse_correspondencia_${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
        this.alertService.success('Acuse descargado correctamente');
      },
      error: (error) => {
        this.alertService.error('Error al descargar el acuse');
      },
    });
  }

  // Handler para el botón PDF en la columna Acuse
  onPDFCorrespondence(row: any): void {
    const id = row.id_correspondencia;
    if (!id) {
      this.alertService.error(
        'No se encontró el identificador de correspondencia.'
      );
      return;
    }
    this.correspondenceService.downloadCorrespondencePdf(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Correspondencia_${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
        this.alertService.success('PDF descargado correctamente');
      },
      error: (error) => {
        this.alertService.error('Error al descargar el PDF');
      },
    });
  }

  showChart() {
    this.router.navigate(['promette/correspondence/chart']);
  }

  onTitleClick() {
    this.clickCount++;
    if (this.clickCount === 7) {
      this.showEasterEgg();
      this.clickCount = 0;
    }
  }

  showEasterEgg() {
    this.messageService.add({
      key: 'easterEgg',
      severity: 'success',
      summary: 'Juega con la palabra Que show',
      detail: '¡Has descubierto el secreto de correspondencia!',
      life: 5000,
    });
  }

  onReject() {
    // Acción al cerrar el toast (opcional)
  }
}
