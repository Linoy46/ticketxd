import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FundingSource } from './interfaces/budgets.interface';
import { FormComponent } from './form/form/form.component';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';
import { localeText } from '../../../core/helpers/localText';
import { Router } from '@angular/router';
import { ApplicantService } from '../services/applicant..service';
import { DiagnosisResponse } from '../interfaces/Documentos/Diagnostico.interface';
import { Diagnostico } from '../interfaces/Documentos/Diagnostico.interface';
import { ViewDocumentApplicantService } from '../services/view-document-applicant.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CoreAlertService } from '../../../core/services/core.alert.service';

// Registrar los módulos de ag-Grid
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-patient-administration',
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    NgbNavModule,
    AgGridAngular,
    SharedCustomModalComponent,
    SharedActionsGridComponent,
  ],
  templateUrl: './patient-administration.component.html',
  styleUrl: './patient-administration.component.scss',
})
export class PatientAdministrationComponent implements OnInit {
  /**
   * Datos de fuentes de financiamiento
   * @todo Reemplazar con carga desde API
   */
  fundingSources: FundingSource[] = [
    {
      id: 1,
      description: '',
      type: '',
      amount: 0,
      status: '',
    },
  ];

  searchTerm = '';
  activeTab = 'all';
  isAddDialogOpen = false;
  currentSource: FundingSource | null = null;
  newSource: FundingSource = {
    id: 0,
    description: '',
    type: '',
    amount: 0,
    status: 'active',
  };

  // Store filtered results to prevent disappearing rows
  filteredActiveTabData: FundingSource[] = [];

  // ag-Grid configuración
  myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });

  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 25, 50];

  /**
   * @property {ColDef[]} columnDefs - Definición de columnas para ag-Grid
   */

  columnDefs: ColDef[] = [
    {
      field: 'id_diagnostico',
      headerName: 'ID',
      maxWidth: 80,
      minWidth: 80,
      filter: true,
    },
    {
      field: 'curp',
      headerName: 'CURP del usuario',
      maxWidth: 320,
      minWidth: 180,
      filter: true,
      valueGetter: (params: any) => {
        return params.data.curp ? params.data.curp.toUpperCase() : '';
      },
    },
    {
      field: 'nombreCompleto',
      headerName: 'Nombre del Usuario',
      flex: 1,
      minWidth: 260,
      filter: true,
      valueGetter: (params: any) => {
        return params.data.nombreCompleto
          ? params.data.nombreCompleto.toUpperCase()
          : '';
      },
    },
    {
      field: 'tipo_necesidad',
      headerName: 'Tipo de atención',
      maxWidth: 320,
      minWidth: 180,
      filter: true,
      valueGetter: (params: any) => {
        return params.data.tipo_necesidad
          ? params.data.tipo_necesidad.toUpperCase()
          : '';
      },
    },
    {
      field: 'rehabilitacion_fisica',
      headerName: 'Rehabilitación física',
      maxWidth: 320,
      minWidth: 180,
      filter: true,
      valueGetter: (params: any) => {
        return params.data.rehabilitacion_fisica
          ? params.data.rehabilitacion_fisica.toUpperCase()
          : '';
      },
    },
    {
      field: 'dt_aspirante',
      valueGetter: (params) => {
        const aspirante = params.data.dt_aspirante;
        const nombre = aspirante
          ? `${aspirante.nombre} ${aspirante.apellido_paterno} ${aspirante.apellido_materno}`
          : '';
        return nombre ? nombre.toUpperCase() : '';
      },
      headerName: 'Facilitador',
      flex: 1,
      minWidth: 260,
      filter: true,
    },
    {
      headerName: 'Diagnóstico',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: {
        onView: (row: any) => this.view(row, 'ruta_diagnostico'),
      },
      valueGetter: (params: any) => {
        const diagnosticos = params.data.dt_diagnostico_aneecs;
        return diagnosticos && diagnosticos.length > 0
          ? 'Ver diagnóstico'
          : 'Sin diagnóstico';
      },
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: 'INE Tutor',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: {
        onView: (row: any) => this.view(row, 'ruta_INE_tutor'),
      },
      valueGetter: (params: any) => {
        const value = params.data.ruta_INE_tutor;
        return value ? 'Ver INE Tutor' : 'Sin INE Tutor';
      },
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: 'Acta Nacimiento',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: {
        onView: (row: any) => this.view(row, 'ruta_acta_nacimiento_usuario'),
      },
      valueGetter: (params: any) => {
        const value = params.data.ruta_acta_nacimiento_usuario;
        return value ? 'Ver Acta Nacimiento' : 'Sin Acta Nacimiento';
      },
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: 'Comprobante Domicilio',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: {
        onView: (row: any) => this.view(row, 'ruta_comprobante_domicilio'),
      },
      valueGetter: (params: any) => {
        const value = params.data.ruta_comprobante_domicilio;
        return value
          ? 'Ver Comprobante Domicilio'
          : 'Sin Comprobante Domicilio';
      },
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: 'Privacidad Usuario',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: {
        onView: (row: any) => this.view(row, 'ruta_privacidad_usuario'),
      },
      valueGetter: (params: any) => {
        const value = params.data.ruta_privacidad_usuario;
        return value ? 'Ver Privacidad Usuario' : 'Sin Privacidad Usuario';
      },
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: 'Carta Compromiso',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: {
        onView: (row: any) => this.view(row, 'ruta_carta_compromiso_usuario'),
      },
      valueGetter: (params: any) => {
        const value = params.data.ruta_carta_compromiso_usuario;
        return value ? 'Ver Carta Compromiso' : 'Sin Carta Compromiso';
      },
      flex: 1,
      minWidth: 150,
    },
  ];

  rowData: Diagnostico[] = [];

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

  constructor(
    private modalService: CoreModalService,
    private router: Router,
    private applicantService: ApplicantService,
    private documentApplicantService: ViewDocumentApplicantService,
    private santitizer: DomSanitizer,
    private coreAlertService: CoreAlertService
  ) {
    /**
     * @todo Para integración backend:
     * - Inyectar servicio HTTP para consumir API REST
     * - Inyectar servicio de notificaciones para manejo de errores
     * - Considerar inyectar servicio de autorización para permisos
     */
  }

  ngOnInit() {
    // Ajustar columnas para tablets - solo mostrar 3 columnas con mismo ancho
    if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      if (this.columnDefs) {
        this.columnDefs = this.columnDefs.map((col, idx) => {
          if (idx === 0) {
            // ID
            return {
              ...col,
              width: 170,
              maxWidth: 170,
              minWidth: 170,
            };
          } else if (idx === 1) {
            // CURP
            return {
              ...col,
              width: 170,
              maxWidth: 170,
              minWidth: 170,
            };
          } else if (idx === 2) {
            return {
              ...col,
              width: 160,
              maxWidth: 160,
              minWidth: 160,
              flex: undefined,
            };
          }
          return col;
        });
      }
    } else if (window.innerWidth <= 900) {
      if (this.columnDefs) {
        this.columnDefs = this.columnDefs.map((col, idx) => {
          if (idx < 3) {
            return {
              ...col,
              width: 110,
              minWidth: 110,
              maxWidth: 110,
            };
          }
          return col;
        });
      }
    }
    this.getDiagnosticos();
    // Initialize filtered data
    this.updateFilteredData();
  }

  /**
   * Actualiza los datos filtrados según pestaña activa y término de búsqueda
   * @method updateFilteredData
   * @todo Para integración backend: Considerar mover filtrado al servidor
   */
  updateFilteredData() {
    let filtered = this.fundingSources.filter(
      (source) =>
        source.description
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        source.type.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    if (this.activeTab !== 'all') {
      filtered = filtered.filter((source) => source.status === this.activeTab);
    }

    this.filteredActiveTabData = filtered;
  }

  get filteredActiveTab(): FundingSource[] {
    return this.filteredActiveTabData;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.updateFilteredData();
  }

  // Manually trigger data refresh when search term changes
  onSearchChange() {
    this.updateFilteredData();
  }

  newDiagnosis() {
    this.router.navigate(['/promette/patient-diagnosis']);
  }

  getDiagnosticos() {
    this.applicantService.getDiagnosticos().subscribe({
      next: (response: DiagnosisResponse) => {
        if (response.success && response.diagnosticos) {
          this.rowData = response.diagnosticos;
          console.log(`Diagnosticados ${this.rowData}`);
        } else {
          console.error('Error en la respuesta:', response.message);
        }
      },
      error: (error) => {
        console.error('Error al obtener los datos:', error);
      },
    });
  }

  view(row: any, field: string) {
    const value = row[field];
    this.documentApplicantService.getDocument(value).subscribe(
      (blob: Blob) => {
        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          const pdfURL = this.santitizer.bypassSecurityTrustResourceUrl(url);
          this.modalService.open(null, 'Documento', { data: {} }, '', url);
        }
      },
      (error) => {
        this.coreAlertService.error('Error al obtener el documento');
      }
    );
  }
}
