import { Component, OnInit, effect } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { SharedCustomModalComponent } from '../../shared/shared-custom-modal/shared-custom-modal.component';
import { CommonModule } from '@angular/common';
import { SharedActionsGridComponent } from '../../shared/shared-actions-grid/shared-actions-grid.component';
import { CoreModalService } from '../../core/services/core.modal.service';
import { CoreAlertService } from '../../core/services/core.alert.service';
import { EscalafonService } from './services/escalafon.service';
import { localeText } from '../../core/helpers/localText';
import { Dictamen } from './interfaces/interfaces';
import {
  AllCommunityModule,
  ColDef,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
  RowModelType,
  themeQuartz,
} from 'ag-grid-community';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../store';
import { environment } from '../../../environments/environment';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-escalafon',
  imports: [AgGridAngular, SharedCustomModalComponent, CommonModule],
  templateUrl: './escalafon.component.html',
  styleUrl: './escalafon.component.scss',
})
export class EscalafonComponent implements OnInit {
  constructor(
    private modalService: CoreModalService,
    private escalafonService: EscalafonService, // Inyecta el servicio de datos para acceder a las APIs.
    private alertService: CoreAlertService
  ) {}

  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );

  // Aquí se obtiene el usuario con un getter
  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }

  private permissionsSelector = injectSelector<RootState, any>(
    (state) => state.auth.permissions
  );
  // Aquí se obtiene el usuario con un getter
  get permissions() {
    return this.permissionsSelector(); // Se actualiza automáticamente
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  // Detectar si es móvil
  isMobile = false;
  isTablet = false;

  rutaCatalogo = environment.apiUrlRupeet + '/escalafon/catalogo/';
  rutaClave = environment.apiUrlRupeet + '/escalafon/formato/clave/funcion/';

  loadingReporte = false;
  periodo_escalafon = '';
  rowData: Dictamen[] = [];
  ids_grado_academico: number[] = [];

  arregloPorPermisos() {
    this.ids_grado_academico = [];
    if (this.hasPermission('Escalafón:ver_edu_ini')) {
      this.ids_grado_academico.push(1);
    }
    if (this.hasPermission('Escalafón:ver_pree')) {
      this.ids_grado_academico.push(2);
    }
    if (this.hasPermission('Escalafón:ver_prim')) {
      this.ids_grado_academico.push(3);
    }
    if (this.hasPermission('Escalafón:ver_edu_esp')) {
      this.ids_grado_academico.push(4);
    }
    if (this.hasPermission('Escalafón:ver_sec_gral')) {
      this.ids_grado_academico.push(5);
    }
    if (this.hasPermission('Escalafón:ver_sec_tec')) {
      this.ids_grado_academico.push(6);
    }
    if (this.hasPermission('Escalafón:ver_tel_sec')) {
      this.ids_grado_academico.push(7);
    }
    if (this.hasPermission('Escalafón:ver_ofi_ctr')) {
      this.ids_grado_academico.push(8);
    }
    if (this.hasPermission('Escalafón:ver_edu_ind')) {
      this.ids_grado_academico.push(9);
    }
    if (this.hasPermission('Escalafón:ver_prim_tran')) {
      this.ids_grado_academico.push(10);
    }
    if (this.hasPermission('Escalafón:ver_extra')) {
      this.ids_grado_academico.push(11);
    }
    if (this.hasPermission('Escalafón:ver_tel_sec_tran')) {
      this.ids_grado_academico.push(12);
    }
    // console.log("IDs permitidos: ",this.ids_grado_academico)
  }

  private alreadyInit = false;

  private onPermissionsReady = effect(() => {
    const perms = this.permissions;

    if (this.alreadyInit) return;
    if (!Array.isArray(perms)) return;

    if (perms.length === 0) return;

    this.alreadyInit = true;
    this.arregloPorPermisos();
    this.setupColumnDefs();
    this.loadData();
  });

  ngOnInit(): void {
    this.checkMobileScreen();
    //this.setupColumnDefs();
    //this.loadData();
    // Llama al método `loadData()` para cargar los datos de la API cuando el componente se inicializa.
    this.escalafonService.consultarInicioFolioEscalafon().subscribe({
      next: (resp) => {
        this.periodo_escalafon = resp?.folio?.[0]?.valor_parametro ?? '';
      },
      error: (err) => {
        console.error('Error consultando folio:', err);
        this.periodo_escalafon = ''; // evita mandar undefined
      },
    });

    // Escuchar cambios de tamaño de pantalla
    window.addEventListener('resize', () => {
      this.checkMobileScreen();
      this.setupColumnDefs();
      if (this.gridApi) {
        this.gridApi.setGridOption('columnDefs', this.columnDefs);
        // No ajustar columnas en móvil para permitir scroll horizontal
        if (!this.isMobile) {
          this.gridApi.sizeColumnsToFit();
        }
      }
    });
  }

  // Detectar si es dispositivo móvil o tableta
  private checkMobileScreen(): void {
    if (window.innerWidth < 768) {
      this.isMobile = true;
      this.isTablet = false;
    } else if (window.innerWidth < 1024) {
      this.isMobile = false;
      this.isTablet = true;
    } else {
      this.isMobile = false;
      this.isTablet = false;
    }
  }

  // Configurar columnas según el dispositivo
  private setupColumnDefs(): void {
    //Aquí se ajustan a 3 columnas si es dispositivo móvil
    if (this.isMobile) {
      let mobileBase = Math.floor(window.innerWidth / 3) - 9;
      if (mobileBase < 100) mobileBase = 100;
      this.columnDefs = [
        { field: 'folio_dictamen', headerName: 'Folio', minWidth: mobileBase },
        {
          field: 'nombre_completo',
          headerName: 'Nombre',
          minWidth: mobileBase,
        },
        {
          field: 'dt_informacion_rupeet.curp',
          headerName: 'CURP',
          minWidth: mobileBase,
        },
        {
          field: 'dt_informacion_rupeet.rfc',
          headerName: 'RFC',
          minWidth: mobileBase + 40,
        },
        {
          field: 'puntaje_conocimiento',
          headerName: 'Conocimiento',
          minWidth: mobileBase + 40,
        },
        {
          field: 'puntaje_escalafon',
          headerName: 'P. Escalafón',
          minWidth: mobileBase + 40,
        },
        {
          field: 'puntaje_antiguedad',
          headerName: 'Antigüedad',
          minWidth: mobileBase + 40,
        },
        {
          field: 'total_puntaje_escalafon',
          headerName: 'Total',
          minWidth: mobileBase + 40,
        },
        { field: 'estatus', headerName: 'Estatus', minWidth: mobileBase + 40 },
        {
          field: 'actions',
          filter: false,
          headerName: 'Acciones',
          cellStyle: {
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
          cellRenderer: SharedActionsGridComponent,
          cellRendererParams: (params: any) => {
            const value = params.data.estatus;
            if (
              value === 'Aceptado' &&
              this.hasPermission('Escalafón:validar_folios')
            ) {
              return {
                onEdit: this.edit.bind(this),
                onPDF: this.pdf.bind(this),
                onHabilitar: this.habilitar.bind(this),
              };
            }
            return {
              onEdit: this.edit.bind(this),
              onPDF: this.pdf.bind(this),
            };
          },
          minWidth: mobileBase + 60,
        },
      ];
      this.gridOptions.rowHeight = 60;
    } else if (this.isTablet) {
      this.columnDefs = this.getTabletColumnDefs();
      this.gridOptions.rowHeight = 70;
    } else {
      this.columnDefs = this.getDesktopColumnDefs();
      this.gridOptions.rowHeight = 80;
    }
  }

  // Columnas para móviles (reducidas)
  private getMobileColumnDefs(): ColDef[] {
    return [
      {
        field: 'folio_dictamen',
        headerName: 'Folio',
        flex: 2,
        minWidth: 180,
        maxWidth: 240,
        cellStyle: { fontSize: '12px' },
      },
      {
        field: 'nombre_completo',
        headerName: 'Nombre',
        flex: 2,
        minWidth: 200,
        cellStyle: { fontSize: '12px' },
        cellRenderer: (params: any) => {
          return `<div style="line-height: 1.2; padding: 2px 0;">${
            params.value || ''
          }</div>`;
        },
      },
      {
        field: 'total_puntaje_escalafon',
        headerName: 'Total',
        flex: 1,
        minWidth: 80,
        maxWidth: 100,
        cellStyle: {
          fontSize: '12px',
          textAlign: 'center',
          fontWeight: 'bold',
        },
      },
      {
        field: 'actions',
        filter: false,
        headerName: 'Acciones',
        cellStyle: {
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        cellRenderer: SharedActionsGridComponent,
        cellRendererParams: {
          onEdit: this.edit.bind(this),
          onPDF: this.pdf.bind(this),
          showOnlyEdit: true, // Solo mostrar botón de editar en móviles
          showOnlyPDF: true, // Solo mostrar botón de PDF en móviles
        },
        flex: 1,
        minWidth: 120,
        maxWidth: 150,
      },
    ];
  }

  // Columnas para tablet
  private getTabletColumnDefs(): ColDef[] {
    return [
      {
        field: 'folio_dictamen',
        headerName: 'Folio',
        flex: 3,
        minWidth: 220,
        maxWidth: 300,
        cellStyle: { fontSize: '13px' },
      },
      {
        field: 'nombre_completo',
        headerName: 'Nombre',
        flex: 3,
        minWidth: 240,
        cellStyle: { fontSize: '13px' },
        cellRenderer: (params: any) => {
          return `<div style="line-height: 1.2; padding: 2px 0;">${
            params.value || ''
          }</div>`;
        },
      },
      {
        field: 'total_puntaje_escalafon',
        headerName: 'Total',
        flex: 2,
        minWidth: 100,
        maxWidth: 140,
        cellStyle: {
          fontSize: '13px',
          textAlign: 'center',
          fontWeight: 'bold',
        },
      },
      {
        field: 'actions',
        filter: false,
        headerName: 'Acciones',
        cellStyle: {
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        cellRenderer: SharedActionsGridComponent,
        cellRendererParams: {
          onEdit: this.edit.bind(this),
          onPDF: this.pdf.bind(this),
          showOnlyEdit: true,
          showOnlyPDF: true,
        },
        flex: 2,
        minWidth: 150,
        maxWidth: 200,
      },
    ];
  }

  // Columnas para escritorio (completas)
  private getDesktopColumnDefs(): ColDef[] {
    const columns: ColDef[] = [
      // {
      //   field: 'folio_dictamen',
      //   headerName: 'Folio',
      //   flex: 1,
      //   minWidth: 160, // Ancho mínimo para asegurar visibilidad
      // },
      {
        field: 'nombre_completo',
        headerName: 'Nombre',
        flex: 1,
        minWidth: 250, // Ancho mínimo
      },
      {
        field: 'dt_informacion_rupeet.curp',
        headerName: 'CURP',
        flex: 1,
        minWidth: 200, // Ancho mínimo
      },
      {
        field: 'dt_informacion_rupeet.rfc',
        headerName: 'RFC',
        flex: 1,
        minWidth: 150,
      },
      // {
      //   field: 'ct_grado_academico.grado_academico',
      //   headerName: 'Grado Académico',
      //   flex: 1,
      //   maxWidth: 200,
      // },
      {
        field: 'puntaje_conocimiento',
        headerName: 'Conocimiento',
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'puntaje_escalafon',
        headerName: 'P. Escalafón',
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'puntaje_antiguedad',
        headerName: 'Antigüedad',
        flex: 1,
        minWidth: 140,
      },
      {
        field: 'total_puntaje_escalafon',
        headerName: 'Total',
        flex: 1,
        minWidth: 100,
      },
      {
        field: 'estatus',
        headerName: 'Estatus',
        flex: 1,
        minWidth: 140,
      },
      /* {
        field: 'actions',
        filter: false,
        headerName: 'Acciones',
        cellStyle: {
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        cellRenderer: SharedActionsGridComponent,
        cellRendererParams: {
          onEdit: this.edit.bind(this),
          onPDF: this.pdf.bind(this),
        },
        flex: 1,
        maxWidth: 150,
      },*/
      {
        field: 'actions',
        filter: false,
        headerName: 'Acciones',
        cellStyle: {
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        cellRenderer: SharedActionsGridComponent,
        cellRendererParams: (params: any) => {
          const value = params.data.estatus;
          if (
            value === 'Aceptado' &&
            this.hasPermission('Escalafón:validar_folios')
          ) {
            return {
              onEdit: this.edit.bind(this),
              onPDF: this.pdf.bind(this),
              onHabilitar: this.habilitar.bind(this),
            };
          }
          return {
            onEdit: this.edit.bind(this),
            onPDF: this.pdf.bind(this),
          };
        },
        flex: 1,
        minWidth: 215,
      },
    ];

    if (this.isMobile) {
      columns[0].pinned = 'left';
    }

    return columns;
  }

  loadData(): void {
    this.escalafonService.getData(this.ids_grado_academico).subscribe({
      next: (data) => {
        this.rowData = [...data];
      },
      error: (error) => {
        //console.error('Sin registros. Verifique con el Adminstrador si cuenta con permisos suficientes.', error);
      },
    });
  }

  // loadData(): void {
  //   this.escalafonService.getData().subscribe({
  //     next: (data) => {
  //       const dictamenes = data.dictamenes;
  //       const ids = dictamenes.map((d: any) => d.dt_informacion_rupeet_id);

  //       this.escalafonService.getDictamenes(ids).subscribe({
  //         next: (resp) => {
  //           const usuarios = resp.usuarios_dictamen;

  //           // Combinar dictamenes con datos del usuario
  //           this.rowData = dictamenes.map((dict: any) => {
  //             const user = usuarios.find(
  //               (u: any) => u.id_informacion_rupeet === dict.dt_informacion_rupeet_id
  //             );

  //             return {
  //               ...dict,
  //               ...user, // ← añade nombre_completo, curp, rfc directamente al objeto
  //             };
  //           });

  //           console.log('Resultado final de this.rowData:', this.rowData);
  //         },
  //         error: (error) => {
  //           console.error('Error al cargar los usuarios:', error);
  //         },
  //       });
  //     },
  //     error: (error) => {
  //       console.error('Error al cargar los dictámenes:', error);
  //     },
  //   });
  // }

  myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });
  // Configura un tema personalizado para la tabla ag-Grid usando parámetros como espaciado, colores, etc.

  public paginationPageSize = 10;
  // Define la cantidad de filas que se mostrarán por página en la paginación de la tabla.

  public paginationPageSizeSelector: number[] | boolean = [10, 25, 50];
  // Define las opciones de tamaño de página disponibles para la tabla.

  columnDefs: ColDef[] = []; // Se inicializa vacío, se llena en setupColumnDefs()

  //
  // Métodos para las acciones de las filas
  view(row: any) {
    console.log('Viendo registro: ', row.curp);
    console.log('ver');
    window.open(`${environment.urlEscalafon}/form?curp=${row.curp}`, '_self');
  }

  edit(row: any) {
    console.log('Editando registro: ', row.dt_informacion_rupeet.curp);
    //window.open(`${environment.urlEscalafon}/form?curp=${row.dt_informacion_rupeet.curp}`, '_blank');
    window.open(
      // `https://dev.septlaxcala.gob.mx/escalafon/escalafon/form?curp=${row.dt_informacion_rupeet.curp}`,
      `${environment.urlEscalafon}/form?curp=${row.dt_informacion_rupeet.curp}`,
      '_self'
    );
  }
  habilitar(row: any) {
    this.escalafonService.habilitarAdmin(row.folio_dictamen).subscribe({
      next: (info) => {
        this.alertService.success(
          `Se ha habilitado nuevamente el dictamen con el folio "${row.folio_dictamen}"`
        );
        this.loadData();
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  pdf(row: any) {
    console.log('Generando PDF para el registro: ', row.folio_dictamen);

    this.escalafonService.generarPdf(row.folio_dictamen).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'dictamen_escalafon.pdf';
      // a.click();
      // window.URL.revokeObjectURL(url);
      window.open(url, '_blank');
    });
  }

  agregar() {
    console.log('agregar');
    window.open(`${environment.urlEscalafon}/form`, '_self');
  }

  reporte() {
    console.log('Reporte');
    window.open(`${this.rutaCatalogo + this.periodo_escalafon}`, '_self');
  }

  claveFuncion() {
    console.log('Reporte Clave Función');
    window.open(`${this.rutaClave + this.periodo_escalafon}`, '_self');
  }

  //AÑADIR BUSCADOR
  defaultColDef = {
    flex: 1,
    filter: true,
    sortable: true,
    cellClass: 'cell-center',
    resizable: true,
    filterParams: {
      buttons: ['reset', 'apply'],
      closeOnApply: true,
    },
    floatingFilter: false,
  };

  gridOptions = {
    rowModelType: 'clientSide' as RowModelType,
    defaultColDef: {
      flex: 1,
      filter: false,
      sortable: true,
      cellClass: 'cell-center',
      resizable: true,
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true,
      },
      floatingFilter: false,
    },
    rowHeight: 80,
    paginationPageSize: 10,
    columnChooser: true,
    localeText: localeText,
    quickFilterText: '',
    suppressRowClickSelection: true,
    animateRows: true,
    enableCellTextSelection: true,
    ensureDomOrder: true,
    suppressColumnVirtualisation: true, // Solución para problemas de renderizado
    // Optimizaciones para móviles
    suppressHorizontalScroll: false, // Permitir scroll horizontal en móviles
    alwaysShowHorizontalScroll: false,
    suppressRowVirtualisation: false,
  };

  private gridApi!: GridApi;
  public quickFilterText: string = '';

  // Guarda la referencia de la API para poder manipular la grilla después.
  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api; // Se guarda la instancia de la API de ag-Grid

    // Se optimiza para móviles
    if (this.isMobile) {
      // No se llama a sizeColumnsToFit() para permitir el scroll horizontal
    } else {
      // En escritorio, se mantiene igual
      setTimeout(() => {
        this.gridApi.sizeColumnsToFit();
      }, 100);
    }
  }

  // Método para aplicar un filtro cuando el usuario escribe en el campo de búsqueda.
  // Intenta usar la API de ag-Grid para actualizar el modelo de filtros.
  setQuickFilter(filterValue: string): void {
    if (this.gridApi) {
      this.quickFilterText = filterValue; // Almacena el valor ingresado por el usuario
      this.gridApi.setFilterModel({ quickFilter: filterValue }); // Aplica un filtro con un modelo
    } else {
      console.error('Grid API no está inicializado.'); // Muestra un mensaje de error si la API aún no está disponible
    }
  }

  generarDictamen(row: any) {
    console.log('generando dictamen');
  }
  onGenerarReporte(): void {
    if (!this.periodo_escalafon) return;
    this.loadingReporte = true;
    this.escalafonService
      .generaCatalogoExcel(this.periodo_escalafon)
      .pipe(finalize(() => (this.loadingReporte = false)))
      .subscribe({
        next: (resp) => {
          // Si el backend devuelve un archivo, aqui se descarga como Blob.
          // consumimos endpoint
          console.log('Reporte generado:', resp);
        },
        error: (err) => {
          console.error('Error generando reporte:', err);
        },
      });
  }
}
