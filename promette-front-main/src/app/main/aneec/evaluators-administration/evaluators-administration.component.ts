import { Component, effect, OnInit } from '@angular/core';
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
import { NewAplicant } from '../interfaces/applicantInterface/PersonaInscrita.Interface';
import { PatientDiagnosisComponent } from '../patient-diagnosis/patient-diagnosis.component';
import { ViewDocumentApplicantService } from '../services/view-document-applicant.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-evaluators-administration',
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    NgbNavModule,
    AgGridAngular,
    SharedCustomModalComponent,
    SharedActionsGridComponent,
  ],
  templateUrl: './evaluators-administration.component.html',
  styleUrl: './evaluators-administration.component.scss',
})
export class EvaluatorsAdministrationComponent implements OnInit {
  //Obtencion del usuario por redux
  private userSelector = injectSelector<RootState, any>((state) => state.auth);
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

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
   * @property {ColDef[]} columnDefs 
   
   */
  columnDefs: ColDef[] = [
    /*{
      field: 'id_aspirante',
      headerName: 'ID',
      maxWidth: 80,
      minWidth: 80,
      filter: true,
    },*/
    {
      field: '',
      headerName: 'Operaciones',
      cellRenderer: (params: any) => {
        const id = params.data.id_aspirante;
        const status = params.data.status;
        const isDisabled = status !== 'EN PROCESO';
        return `
          <div class="d-flex gap-2 mt-1">
            <button class="btn btn-success" title="Validar" ${
              isDisabled ? 'disabled' : ''
            } onclick="angularComponentRef.changeStatus(${id}, 'VALIDADO')"><i class="bi bi-check-lg"></i></button>
            <button class="btn btn-danger" title="Rechazar" ${
              isDisabled ? 'disabled' : ''
            } onclick="angularComponentRef.changeStatus(${id}, 'RECHAZADO')"><i class="bi bi-x-lg"></i></button>
          </div>
        `;
      },
      flex: 1,
      minWidth: 120,
      filter: false,
    },
    {
      field: 'status',
      headerName: 'Estatus',
      flex: 1,
      minWidth: 140,
      filter: true,
    },
    {
      field: 'curp',
      headerName: 'Facilitador CURP',
      flex: 1,
      minWidth: 200,
      filter: true,
      valueGetter: (params: any) => {
        return params.data.curp ? params.data.curp.toUpperCase() : '';
      },
    },
    {
      headerName: 'Acuse',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: (params: any) => {
        const curp = params.data.curp;
        const hasValidCurp = curp && curp.trim() !== '';

        return {
          onView: hasValidCurp
            ? (row: any) => this.viewReceipt(row.curp)
            : undefined,
          showUnavailableIcon: !hasValidCurp,
        };
      },
      flex: 1,
      minWidth: 100,
    },
    {
      field: 'nombre',
      valueGetter: (params) => {
        const nombre = `${params.data.nombre} ${params.data.apellido_paterno} ${params.data.apellido_materno}`;
        return nombre ? nombre.toUpperCase() : '';
      },
      headerName: 'Nombre',
      flex: 1,
      minWidth: 200,
      filter: true,
    },
    {
      field: 'correo',
      headerName: 'Correo',
      flex: 1,
      minWidth: 200,
      filter: true,
      valueGetter: (params: any) => {
        return params.data.correo ? params.data.correo.toUpperCase() : '';
      },
    },
    {
      field: 'telefono',
      headerName: 'Telefono',
      flex: 1,
      minWidth: 130,
      filter: true,
    },
    {
      field: 'instituto',
      headerName: 'Universidad',
      flex: 1,
      minWidth: 210,
      filter: true,
      valueGetter: (params: any) => {
        return params.data.instituto ? params.data.instituto.toUpperCase() : '';
      },
    },
    {
      field: 'licenciatura',
      headerName: 'Licenciatura',
      flex: 1,
      minWidth: 220,
      filter: true,
      valueGetter: (params: any) => {
        return params.data.licenciatura
          ? params.data.licenciatura.toUpperCase()
          : '';
      },
    },
    {
      headerName: 'INE',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: (params: any) => {
        const ruta = params.data.ruta_ine;
        const hasValidDocument = ruta && ruta.trim() !== '';

        return {
          onView: hasValidDocument
            ? (row: any) => this.view(row, 'ruta_ine')
            : undefined,
          showUnavailableIcon: !hasValidDocument,
        };
      },
      flex: 1,
      maxWidth: 100,
    },
    {
      field: 'tipo_documento',
      headerName: 'Tipo de comprobante',
      flex: 1,
      minWidth: 200,
      filter: true,
      valueGetter: (params: any) => {
        return params.data.tipo_documento
          ? params.data.tipo_documento.toUpperCase()
          : '';
      },
    },
    {
      headerName: 'Comprobante de estudios',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: (params: any) => {
        const ruta = params.data.ruta_comprobante_estudio;
        const hasValidDocument = ruta && ruta.trim() !== '';

        return {
          onView: hasValidDocument
            ? (row: any) => this.view(row, 'ruta_comprobante_estudio')
            : undefined,
          showUnavailableIcon: !hasValidDocument,
        };
      },
      flex: 1,
      minWidth: 230,
    },
    {
      headerName: 'Comprobante de domicilio',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: (params: any) => {
        const ruta = params.data.ruta_comprobante_domicilio;
        const hasValidDocument = ruta && ruta.trim() !== '';

        return {
          onView: hasValidDocument
            ? (row: any) => this.view(row, 'ruta_comprobante_domicilio')
            : undefined,
          showUnavailableIcon: !hasValidDocument,
        };
      },
      flex: 1,
      minWidth: 230,
    },
    {
      headerName: 'Carta compromiso',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: (params: any) => {
        const ruta = params.data.ruta_carta_compromiso;
        const hasValidDocument = ruta && ruta.trim() !== '';

        return {
          onView: hasValidDocument
            ? (row: any) => this.view(row, 'ruta_carta_compromiso')
            : undefined,
          showUnavailableIcon: !hasValidDocument,
        };
      },
      flex: 1,
      minWidth: 190,
    },
    /* {
      headerName: 'Carta compromiso del tutor',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: {
        onView: (row: any) => this.view(row, 'ruta_carta_compromiso_tutor')
      },
      flex: 1,
      minWidth: 250,
    },*/
    {
      headerName: 'Aviso de privacidad del facilitador',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: (params: any) => {
        const ruta = params.data.ruta_aviso_privacidad_aspirante;
        const hasValidDocument = ruta && ruta.trim() !== '';

        return {
          onView: hasValidDocument
            ? (row: any) => this.view(row, 'ruta_aviso_privacidad_aspirante')
            : undefined,
          showUnavailableIcon: !hasValidDocument,
        };
      },
      flex: 1,
      minWidth: 280,
    },
    /* {
      headerName: 'Aviso de privacidad del usuario',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: (params: any) => {
        const ruta = params.data.ruta_privacidad_usuario;
        const hasValidDocument = ruta && ruta.trim() !== '';
        
        return {
          onView: hasValidDocument ? (row: any) => this.view(row, 'ruta_privacidad_usuario') : undefined,
          showUnavailableIcon: !hasValidDocument
        };
      },
      flex: 1,
      minWidth: 270,
    },*/
    {
      headerName: 'Diagnóstico',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: (params: any) => {
        const diagnosticos = params.data.dt_diagnostico_aneecs;
        const hasDiagnostico = diagnosticos && diagnosticos.length > 0;

        return {
          onView: hasDiagnostico
            ? (row: any) => this.view(row, 'ruta_diagnostico', 0)
            : undefined,
          showUnavailableIcon: !hasDiagnostico,
        };
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
      headerName: 'Diagnóstico 2',
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: (params: any) => {
        const diagnosticos = params.data.dt_diagnostico_aneecs;
        const hasDiagnostico2 = diagnosticos && diagnosticos.length > 1;

        return {
          onView: hasDiagnostico2
            ? (row: any) => this.view(row, 'ruta_diagnostico', 1)
            : undefined,
          showUnavailableIcon: !hasDiagnostico2,
        };
      },
      valueGetter: (params: any) => {
        const diagnosticos = params.data.dt_diagnostico_aneecs;
        return diagnosticos && diagnosticos.length > 1
          ? 'Ver diagnóstico 2'
          : 'N/A';
      },
      flex: 1,
      minWidth: 150,
    },
  ];

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
    (window as any).angularComponentRef = this;

    effect(() => {
      const userData = this.userSelector();
      if (userData) {
        this.currentUserSubject.next(userData);
        console.log(userData.user);
      } else {
        console.log('usuario aún no disponible');
      }
    });
  }

  ngOnInit() {
    // Tablet: solo 3 columnas visibles (igual estrategia que móvil) usando ancho mayor
    if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      if (this.columnDefs) {
        const TABLET_WIDTH = 160; // ancho por columna en tablet (ajuste ligero)
        this.columnDefs = this.columnDefs.map((col) => ({
          ...col,
          width: TABLET_WIDTH,
          minWidth: TABLET_WIDTH,
          maxWidth: TABLET_WIDTH,
          flex: undefined,
        }));
      }
    } else if (window.innerWidth <= 900) {
      if (this.columnDefs) {
        const MOBILE_WIDTH = 110;
        this.columnDefs = this.columnDefs.map((col, idx) => {
          if (idx < 3) {
            return {
              ...col,
              width: MOBILE_WIDTH,
              minWidth: MOBILE_WIDTH,
              maxWidth: MOBILE_WIDTH,
              flex: undefined,
            };
          }
          return col;
        });
      }
    }
    this.getAplicants();
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
    this.router.navigate(['/promette/patient-register']);
  }

  applicants: NewAplicant[] = [];

  getAplicants() {
    this.applicantService.getAplicants().subscribe({
      next: (element: any) => {
        const { applicants } = element;
        this.applicants = applicants;
      },
      error: (error) => {
        this.coreAlertService.error('Error al obtener los datos:', error);
      },
    });
  }

  view(row: any, field: string, index: number = 0) {
    let value: string | undefined;

    // Primero buscar directamente en el objeto row
    value = row[field];

    // Si no se encuentra en row, buscar en dt_diagnostico_aneecs
    if (!value) {
      const diagnosticos = row.dt_diagnostico_aneecs;
      if (diagnosticos && diagnosticos.length > index) {
        value = diagnosticos[index][field];
      }
    }

    if (value) {
      // Verificar que la ruta no sea undefined
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
    } else {
      this.coreAlertService.error('La ruta del documento no está definida');
    }
  }
  onEditRow(row: any) {
    console.log(row);
    this.modalService.open(
      PatientDiagnosisComponent,
      'Añadir diagnostico',
      {
        data: {
          button: 'Editar',
          data: row,
        },
      },
      undefined,
      undefined
    );
  }

  //Modificar el estatus de un facilitador
  changeStatus(id_aspirante: number, status: string) {
    const userData = this.currentUserSubject.getValue();
    const idUsuario = userData.user.id_usuario;

    const message = `¿Estás seguro de que deseas cambiar a "${status.toLowerCase()}" al facilitador?`;
    this.coreAlertService.confirm(message, 'Confirmar').then((result) => {
      if (result.isConfirmed) {
        this.applicantService
          .changeStatus(id_aspirante, status, idUsuario)
          .subscribe({
            next: (response: any) => {
              if (response.success) {
                this.coreAlertService.success(response.message.toLowerCase());
                this.getAplicants(); // Actualizar los datos del ag-Grid
              } else {
                this.coreAlertService.error(response.message.toLowerCase());
              }
            },
          });
      }
    });
  } //end changeStatus

  //Pintar el acuse en el modal
  viewReceipt(curp: string) {
    this.documentApplicantService.getReceiptPdf(curp).subscribe(
      (blob: Blob) => {
        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          const pdfURL = this.santitizer.bypassSecurityTrustResourceUrl(url);
          this.modalService.open(null, 'Acuse', { data: {} }, '', url);
        }
      },
      (error) => {
        this.coreAlertService.error('Error al obtener el acuse');
      }
    );
  }
}
