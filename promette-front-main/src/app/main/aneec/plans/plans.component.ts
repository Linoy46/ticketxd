import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import { ApplicantService } from '../services/applicant..service';
import { ViewDocumentApplicantService } from '../services/view-document-applicant.service';
import {
  RespuestaPlaneaciones,
  DocumentoPlaneacion,
} from '../interfaces/Documentos/Planeacion.interface';
import { localeText } from '../../../core/helpers/localText';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { DomSanitizer } from '@angular/platform-browser';

// Registrar los módulos de ag-Grid
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [
    AgGridAngular,
    CommonModule,
    FormsModule,
    NgbNavModule,
    SharedActionsGridComponent,
    SharedCustomModalComponent,
  ],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss',
})
export class PlansComponent implements OnInit {
  // ag-Grid configuración
  myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });

  // Configuración de paginación
  paginationPageSize = 10;
  paginationPageSizeSelector: number[] | boolean = [10, 25, 50];

  // Variables del controlador
  planeaciones: RespuestaPlaneaciones[] = [];
  rowData: any[] = [];
  columnDefs: ColDef[] = [];

  // Opciones de la grid
  gridOptions = {
    defaultColDef: {
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
      minWidth: 100,
      filterParams: {
        buttons: ['reset', 'apply'],
        debounceMs: 200,
      },
    },
    floatingFilter: true,
    animateRows: true,
    localeText: localeText,
  };

  //constructor
  constructor(
    private applicantService: ApplicantService,
    private documentApplicantService: ViewDocumentApplicantService,
    private modalService: CoreModalService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.getAllPlans();
  }

  // Función para obtener el número máximo de planeaciones por diagnosticado
  getMaxPlaneaciones(planeaciones: RespuestaPlaneaciones[]): number {
    let maxPlaneaciones = 0;
    planeaciones.forEach((planeacion) => {
      const count = planeacion.planeaciones.length;
      if (count > maxPlaneaciones) {
        maxPlaneaciones = count;
      }
    });
    return maxPlaneaciones;
  }

  // Generar columnas dinámicas para fechas y rutas
  generateColumnDefs(maxPlaneaciones: number): ColDef[] {
    const isMobile = window.innerWidth <= 768; // alineado con media query
    const baseColumns: ColDef[] = [
      {
        field: 'facilitador',
        headerName: 'Facilitador',
        ...(isMobile
          ? { width: 110, minWidth: 110, maxWidth: 110 }
          : { minWidth: 300 }),
        filter: true,
        valueGetter: (params: any) =>
          params.data.facilitador ? params.data.facilitador.toUpperCase() : '',
      },
      {
        field: 'curp',
        headerName: 'CURP',
        ...(isMobile
          ? { width: 110, minWidth: 110, maxWidth: 110 }
          : { minWidth: 200 }),
        filter: true,
        valueGetter: (params: any) =>
          params.data.curp ? params.data.curp.toUpperCase() : '',
      },
      {
        field: 'diagnosticado',
        headerName: 'Diagnosticado',
        ...(isMobile
          ? { width: 110, minWidth: 110, maxWidth: 110 }
          : { minWidth: 200 }),
        filter: true,
        valueGetter: (params: any) =>
          params.data.diagnosticado
            ? params.data.diagnosticado.toUpperCase()
            : '',
      },
    ];

    const extraColumns: ColDef[] = [];
    for (let i = 0; i < maxPlaneaciones; i++) {
      extraColumns.push({
        headerName: `Fecha ${i + 1}`,
        field: `fecha${i + 1}`,
        flex: 1,
        minWidth: 120,
        filter: true,
      });
      extraColumns.push({
        headerName: `Planeación ${i + 1}`,
        field: `ruta_planeacion${i + 1}`,
        flex: 1,
        minWidth: 100,
        filter: true,
        cellRenderer: SharedActionsGridComponent,
        cellRendererParams: (params: any) => {
          const rutaField = `ruta_planeacion${i + 1}`;
          const ruta = params.data[rutaField];
          const hasValidDocument = ruta && ruta !== 'N/A' && ruta.trim() !== '';

          return {
            onView: hasValidDocument
              ? (row: any) => this.onView(row[rutaField])
              : undefined,
            showUnavailableIcon: !hasValidDocument,
          };
        },
      });
    }

    return [...baseColumns, ...extraColumns];
  }

  // Transformar los datos para asignar fechas y rutas a columnas dinámicas
  transformPlaneaciones(
    planeaciones: RespuestaPlaneaciones[],
    maxPlaneaciones: number
  ): any[] {
    const transformedData: any[] = [];

    planeaciones.forEach((planeacion) => {
      const row: any = {
        facilitador: `${planeacion.facilitador.nombre} ${planeacion.facilitador.apellido_paterno} ${planeacion.facilitador.apellido_materno}`,
        curp: planeacion.facilitador.curp,
        diagnosticado:
          planeacion.planeaciones[0]?.dt_diagnostico?.nombreCompleto || '',
        tipo_planeacion: planeacion.planeaciones[0]?.nombre_documento || '',
      };

      for (let i = 0; i < maxPlaneaciones; i++) {
        const planeacionItem = planeacion.planeaciones[i];
        if (planeacionItem) {
          row[`fecha${i + 1}`] = new Date(
            planeacionItem.createdAt
          ).toLocaleDateString();
          row[`ruta_documento${i + 1}`] = planeacionItem.ruta_documento;
        } else {
          row[`fecha${i + 1}`] = '';
          row[`ruta_documento${i + 1}`] = 'N/A';
        }
      }

      transformedData.push(row);
    });

    return transformedData;
  }

  getAllPlans() {
    this.applicantService.getAllPlans().subscribe({
      next: (response: DocumentoPlaneacion) => {
        if (response.success && response.planeaciones) {
          const maxPlaneaciones = this.getMaxPlaneaciones(
            response.planeaciones
          );
          this.columnDefs = this.generateColumnDefs(maxPlaneaciones);
          this.rowData = this.transformPlaneaciones(
            response.planeaciones,
            maxPlaneaciones
          );
          console.log(this.rowData);
        } else {
          console.error('Error en la respuesta:', response.message);
        }
      },
      error: (error) => {
        console.error('Error al obtener planeaciones:', error);
      },
    });
  }

  //obtener el documento específico del facilitador
  getSpecificPlan(routeFile: string) {
    this.documentApplicantService
      .getSpecificPlanning(routeFile)
      .subscribe((pdfBlob: Blob) => {
        const url = window.URL.createObjectURL(pdfBlob);
        window.open(url);
      });
  }

  // Método para abrir el modal con el PDF
  onView(routeFile: string) {
    console.log(`RUTA PLANEACION: ${routeFile}`);

    if (routeFile === 'N/A' || !routeFile) {
      console.warn('No hay documento disponible');
      return;
    }

    this.documentApplicantService
      .getSpecificPlanning(routeFile)
      .subscribe((blob: Blob) => {
        if (blob.size > 0) {
          const url = window.URL.createObjectURL(blob);
          const pdfURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.modalService.open(null, 'Documento', { data: {} }, '', url);
        }
      });
  }
}
