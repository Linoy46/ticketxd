import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';
import { localeText } from '../../../core/helpers/localText';
import { ApplicantService } from '../services/applicant..service';
import {
  Reports,
  ReportsInforme,
} from '../interfaces/applicantInterface/PersonaInscrita.Interface';
import { ViewDocumentApplicantService } from '../services/view-document-applicant.service';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';

// Registrar los módulos de ag-Grid
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-patient-new-report',
  imports: [
    CommonModule,
    FormsModule,
    AgGridAngular,
    SharedActionsGridComponent,
    SharedCustomModalComponent,
  ],
  templateUrl: './patient-new-report.component.html',
  styleUrl: './patient-new-report.component.scss',
})
export class PatientNewReportComponent implements OnInit {
  // ag-Grid configuración
  myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });

  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 25, 50];

  // Variables del controlador
  reports: ReportsInforme[] = [];
  rowData: any[] = [];
  columnDefs: ColDef[] = [];

  // Métodos del componente
  constructor(
    private applicantService: ApplicantService,
    private documentApplicantService: ViewDocumentApplicantService,
    private modalService: CoreModalService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.getAllReports();
  }

  viewReport(row: any) {
    console.log('Ver informe:', row);
  }

  deleteReport(row: any) {
    console.log('Eliminar informe:', row);
  }

  // Función para obtener el número máximo de informes por diagnosticado
  getMaxInformes(reports: ReportsInforme[]): number {
    let maxInformes = 0;
    reports.forEach((report) => {
      report.informes.forEach((informe) => {
        const diagnosticado = informe.dt_diagnostico.nombreCompleto;
        const count = report.informes.filter(
          (i) => i.dt_diagnostico.nombreCompleto === diagnosticado
        ).length;
        if (count > maxInformes) {
          maxInformes = count;
        }
      });
    });
    return maxInformes;
  }

  // Generar columnas dinámicas para fechas y rutas
  generateColumnDefs(maxInformes: number): ColDef[] {
    const isMobile = window.innerWidth <= 768; // alineado con media query CSS
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
    for (let i = 0; i < maxInformes; i++) {
      extraColumns.push({
        headerName: `Fecha ${i + 1}`,
        field: `fecha${i + 1}`,
        flex: 1,
        minWidth: 120,
        filter: true,
      });
      extraColumns.push({
        headerName: `Informe ${i + 1}`,
        field: `ruta_informe${i + 1}`,
        flex: 1,
        minWidth: 100,
        filter: true,
        cellRenderer: SharedActionsGridComponent,
        cellRendererParams: (params: any) => {
          const rutaField = `ruta_informe${i + 1}`;
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
  transformReports(reports: ReportsInforme[], maxInformes: number): any[] {
    const transformedData: any[] = [];
    reports.forEach((report) => {
      const informesPorDiagnosticado: {
        [key: string]: { diagnosticado: string; informes: any[] };
      } = {};

      report.informes.forEach((informe) => {
        const diagnosticado = informe.dt_diagnostico.nombreCompleto;
        if (!informesPorDiagnosticado[diagnosticado]) {
          informesPorDiagnosticado[diagnosticado] = {
            diagnosticado: diagnosticado,
            informes: [],
          };
        }
        informesPorDiagnosticado[diagnosticado].informes.push({
          fecha: new Date(informe.createdAt).toLocaleDateString(),
          ruta_informe: informe.ruta_informe,
        });
      });

      Object.keys(informesPorDiagnosticado).forEach((diagnosticado) => {
        const informes = informesPorDiagnosticado[diagnosticado];
        const row: any = {
          facilitador: `${report.facilitador.nombre} ${report.facilitador.apellido_paterno} ${report.facilitador.apellido_materno}`,
          curp: report.facilitador.curp,
          diagnosticado: informes.diagnosticado,
        };

        for (let i = 0; i < maxInformes; i++) {
          row[`fecha${i + 1}`] = informes.informes[i]?.fecha || '';
          row[`ruta_informe${i + 1}`] =
            informes.informes[i]?.ruta_informe || 'N/A';
        }

        transformedData.push(row);
      });
    });
    return transformedData;
  }

  // Obtener todos los informes
  getAllReports() {
    this.applicantService.getAllReports().subscribe({
      next: (response: Reports) => {
        if (response.success && response.informes) {
          const maxInformes = this.getMaxInformes(response.informes);
          this.columnDefs = this.generateColumnDefs(maxInformes);
          this.rowData = this.transformReports(response.informes, maxInformes);
          //console.log(this.rowData);
        } else {
          console.error('Error en la respuesta:', response.message);
        }
      },
    });
  }

  //obtener el informe espesifico del facilitador
  getSpecificInforme(routeFile: string) {
    this.documentApplicantService
      .getSpecificInforme(routeFile)
      .subscribe((pdfBlob: Blob) => {
        const url = window.URL.createObjectURL(pdfBlob);
        window.open(url);
      });
  } //end method

  // Opciones de la grid
  public gridOptions = {
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
    localeText: localeText,
    floatingFilter: true,
    animateRows: true,
  };

  // Método para abrir el modal with el PDF
  onView(routeFile: string) {
    console.log(`RUTA REPORTE: ${routeFile}`);

    this.documentApplicantService
      .getSpecificInforme(routeFile)
      .subscribe((blob: Blob) => {
        if (blob.size > 0) {
          const url = window.URL.createObjectURL(blob);
          const pdfURL = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.modalService.open(null, 'Documento', { data: {} }, '', url);
        }
      });
  }
}
