import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
  themeQuartz,
  ColDef as AgColDef,
} from 'ag-grid-community';
import {
  BudgetsHistorialService,
  HistorialPresupuesto,
} from './budgets.historial.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CoreAlertService } from '../../../../core/services/core.alert.service';
import { localeText } from '../../../../core/helpers/localText';
import { CoreModalService } from '../../../../core/services/core.modal.service';
import { FormComponent } from './form/form.component';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../../store';
import { SharedCustomModalComponent } from '../../../../shared/shared-custom-modal/shared-custom-modal.component';
import { TutorialComponent } from '../../../../shared/tutorial/tutorial.component';
import { TutorialConfig } from '../../../../core/services/tutorial.service';

// Registrar módulos de AG Grid
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-budgets-historial',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgbNavModule,
    AgGridAngular,
    NgbDropdownModule,
    SharedCustomModalComponent,
    TutorialComponent,
  ],
  templateUrl: './budgets.historial.component.html',
  styleUrls: ['./budgets.historial.component.scss'],
})
export class BudgetsHistorialComponent implements OnInit, OnDestroy {
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );

  get user() {
    return this.userSelector();
  }

  [x: string]: any;
  // Control de suscripciones
  private destroy$ = new Subject<void>();

  // Estado de carga
  isLoading = false;
  loadingError: string | null = null;

  // Filtros
  searchTerm = '';
  selectedEstado = 'todos';

  // Variable para pestañas activas
  activeTab = 'historial';

  // Datos para la visualización
  historialData: HistorialPresupuesto[] = [];
  columnDefs: AgColDef<HistorialPresupuesto>[] = [];

  // AG Grid API
  private gridApi!: GridApi<HistorialPresupuesto>;

  // Tema personalizado para AG Grid
  myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });

  // Opciones de paginación
  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 25, 50, 100];

  //* Configuración del tutorial
  tutorialConfig: TutorialConfig = {
    steps: [
      {
        title: 'Navegación de pestañas',
        element: '#nav-tabs',
        intro: 'Aquí puedes navegar entre la gestión de presupuestos y el historial.',
        position: 'bottom',
      },
      {
        title: 'Refrescar tabla',
        element: '#refrescar',
        intro: 'Haz clic aquí para refrescar la tabla del historial.',
        position: 'left',
      },
      {
        title: 'Tabla de historicos',
        element: '#tabla_historicos',
        intro: 'Esta tabla muestra todos los historicos disponibles con información detallada.',
        position: 'top',
      },
      {
        title: 'Filtros de búsqueda',
        element: '.ag-icon-filter',
        intro: 'Utiliza estos filtros en cada columna para buscar presupuestos específicos en el apartado de ID, Año, Área, Descripción o Fecha.',
        position: 'bottom',
      },
      {
        title: 'Estado',
        element: '#estado',
        intro: 'Indica el estado de cada uno de los historicos (<small class="text-success">Activo</small> o <small class="text-danger">Inactivo</small>).',
        position: 'left',
      },
      {
        title: 'Ver',
        element: '#ver',
        intro: 'Ve información detallada del historico seleccionado.',
        position: 'left',
      },
      {
        title: 'Exportar',
        element: '#excel',
        intro: 'Exporta en excel el formato detallado del historico seleccionado.',
        position: 'left',
      },
    ],
    onComplete: () => {
      console.log('Tutorial completado en presupuestos');
    },
    onExit: () => {
      console.log('Tutorial cerrado en presupuestos');
    },
  };


  // Opciones de configuración para AG Grid
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
      cellClass: 'ag-cell-normal',
    },
    localeText: localeText,
    floatingFilter: true,
    animateRows: true,
    suppressCellFlash: true,
    enableCellChangeFlash: false,
    suppressRowHoverHighlight: true,
    suppressRowTransform: true,
    suppressMovableColumns: true,
    suppressColumnVirtualisation: true,
    suppressRowVirtualisation: true,
    rowBuffer: 100,
    immutableData: true,
    immutableColumns: true,
    getRowId: (params: { data: HistorialPresupuesto }) =>
      params.data.id_proyecto_anual.toString(),
    suppressPropertyNamesCheck: true,
    suppressColumnStateEvents: true,
    suppressClickEdit: true,
  };

  constructor(
    private historialService: BudgetsHistorialService,
    private alertService: CoreAlertService,
    private modalService: CoreModalService
  ) {
    // Inicializar definiciones de columnas
    this.columnDefs = this.historialService.getColumnDefs();
  }

  ngOnInit() {
    console.log('BudgetsHistorialComponent: Inicializado');

    // Suscribirse a los cambios en los datos
    this.historialService.historialData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.historialData = data;
        console.log('Datos actualizados en historial component:', data.length);

        // ✅ SIMPLIFICADO: Verificar solo el nombre procesado
        if (data.length > 0) {
          const firstItem = data[0];
          console.log('=== ANÁLISIS SIMPLIFICADO DEL ÁREA ===');
          console.log('- ID Proyecto:', firstItem.id_proyecto_anual);
          console.log('- ct_area_id:', firstItem.dt_techo?.ct_area_id);
          console.log(
            '- Nombre procesado:',
            firstItem.dt_techo?.rl_area_financiero?.nombre
          );
          console.log('=====================================');
        }

        if (this.gridApi) {
          this['setupButtonEventHandlers']();
        }
      });

    // Cargar datos iniciales
    this.loadHistorialData();

    // Usar un delegado de eventos global para manejar clics en los botones
    document.addEventListener('click', this.handleButtonClick.bind(this));
  }

  ngOnDestroy() {
    // Eliminar listener de eventos global
    document.removeEventListener('click', this.handleButtonClick.bind(this));

    this.destroy$.next();
    this.destroy$.complete();
  }

  // Manejador global para clics en botones dentro de AG Grid
  private handleButtonClick(event: MouseEvent): void {
    // Verificar si tenemos la API de la grid
    if (!this.gridApi) {
      return;
    }

    const target = event.target as HTMLElement;
    let buttonElement: HTMLElement | null = null;

    // Buscar el botón más cercano
    if (target.tagName === 'BUTTON') {
      buttonElement = target;
    } else if (target.closest('button')) {
      buttonElement = target.closest('button');
    }

    // Si no encontramos un botón, salir
    if (!buttonElement) return;

    // Verificar si el botón está dentro de la grid
    const gridContainer = document.querySelector('.ag-center-cols-container');
    if (!gridContainer?.contains(buttonElement)) return;

    // Obtener la fila que contiene el botón
    const rowElement = buttonElement.closest('.ag-row');
    if (!rowElement) return;

    // Detener propagación del evento
    event.preventDefault();
    event.stopPropagation();

    // Obtener el ID del proyecto desde el atributo data-id
    const projectId = buttonElement.getAttribute('data-id');
    const area = buttonElement.getAttribute('data-area');
    if (!projectId) return;

    const projectIdNum = parseInt(projectId, 10);

    // Determinar qué acción realizar según la clase del botón
    if (buttonElement.classList.contains('view-detail-btn')) {
      console.log(
        `Botón Ver detalles presionado para proyecto ${projectIdNum}`
      );
      this.showProjectDetails(projectIdNum);
    } else if (buttonElement.classList.contains('export-btn')) {
      console.log(`Botón Exportar presionado para proyecto ${projectIdNum}`);
      this.exportProjectToExcel(projectIdNum);
    } /*else if (buttonElement.classList.contains('export-pdf-btn')) {
      console.log(`Botón Exportar PDF presionado para proyecto ${projectIdNum}`);
      console.log("area: ")
      this.exportProjectToPDF(projectIdNum,"AREA EJEMPLO");
    }*/
      else if (buttonElement.classList.contains('export-pdf-btn')) {
      const projectData = this.getProjectDataFromGrid(projectIdNum);
      if (!projectData) return;

      const nombreArea = this.getAreaNameFromGridRow(projectData);
      console.log(`Exportando PDF para proyecto ${projectIdNum}, área: ${nombreArea}`);
      this.exportProjectToPDF(projectIdNum, nombreArea);
    }

  }

  // Método para cargar datos del historial
  loadHistorialData() {
    this.isLoading = true;
    this.loadingError = null;

    console.log('Iniciando carga de proyectos anuales');

    this.historialService
      .loadHistorialData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log(`Recibidos ${data.length} proyectos anuales`);

          // Verificar detalladamente la estructura de los datos con la ruta correcta
          if (data.length > 0) {
            const firstItem = data[0];
            console.log('Estructura del primer proyecto:');
            console.log('- ID Proyecto:', firstItem.id_proyecto_anual);
            console.log('- Año:', firstItem.año);
            console.log('- ID Techo:', firstItem.dt_techo_id);
            console.log(
              '- Objeto dt_techo completo:',
              JSON.stringify(firstItem.dt_techo)
            );
            console.log(
              '- Nombre área (ruta correcta):',
              firstItem.dt_techo?.rl_area_financiero?.ct_area?.nombre_area
            );
          }

          // Verificar integridad de los datos
          this.validateDataIntegrity(data);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar los proyectos anuales', error);

          // Detallar mejor el mensaje de error para ayudar en la depuración
          let errorMessage = 'No se pudo cargar los proyectos anuales.';

          if (error.message) {
            errorMessage += ' ' + error.message;
          }

          // Si hay más detalles del backend, mostrarlos
          if (error.error?.msg) {
            errorMessage += ' Detalle: ' + error.error.msg;
          }

          // Proporcionar información sobre posibles soluciones
          errorMessage +=
            ' Verifique la conexión al servidor y que el backend esté funcionando correctamente.';

          this.loadingError = errorMessage;
          this.alertService.error(
            'Error al cargar datos',
            'Verifique la consola para más detalles'
          );
          this.isLoading = false;
        },
      });
  }

  // ✅ SIMPLIFICADO: Validar la integridad de los datos recibidos
  private validateDataIntegrity(data: HistorialPresupuesto[]): void {
    if (data.length === 0) {
      console.log('No se recibieron proyectos anuales');
      return;
    }

    console.log('=== VALIDACIÓN SIMPLIFICADA ===');

    // Verificar ct_area_id
    const withCtAreaId = data.filter((p) => !!p.dt_techo?.ct_area_id).length;
    const withAreaName = data.filter(
      (p) => !!p.dt_techo?.rl_area_financiero?.nombre
    ).length;

    console.log(`Proyectos con ct_area_id: ${withCtAreaId}/${data.length}`);
    console.log(
      `Proyectos con nombre procesado: ${withAreaName}/${data.length}`
    );
    console.log('==============================');
  }

  // Método para capturar la API de la grid cuando esté lista
  onGridReady(params: GridReadyEvent<HistorialPresupuesto>): void {
    console.log('Grid lista para recibir datos');
    this.gridApi = params.api;

    if (this.gridApi && this.historialData.length > 0) {
      try {
        this.gridApi.setGridOption('rowData', this.historialData);
        // Configurar manejadores de eventos después de que la grid esté lista
        this.setupButtonEventHandlers();
      } catch (error) {
        console.error(
          'Error al actualizar la grid con datos existentes:',
          error
        );
      }
    }
  }

  // Configurar manejadores de eventos para botones en la grid usando el servicio
  setupButtonEventHandlers(): void {
    console.log('Configurando manejadores de eventos para botones');

    if (!this.gridApi) {
      console.warn(
        'Grid API no disponible para configurar manejadores de eventos'
      );
      return;
    }

    this.historialService.setupGridButtonEvents(
      this.gridApi,
      (id) => this.showProjectDetails(id), // Manejador para botón Ver
      (id) => this.exportProjectToExcel(id), // Manejador para botón Exportar
      (id) => this.exportProjectToPDF(id,"Mandar el area por aqui") // Manejador para botón Exportar
    );
  }

  // Manejadores para filtros y búsqueda
  onSearchChange() {
    this.applyFilters();
  }

  onEstadoChange() {
    this.applyFilters();
  }

  applyFilters() {
    this.historialService['applyFilters'](
      this.searchTerm,
      this.selectedEstado === 'todos' ? undefined : this.selectedEstado
    );
  }

  // Mostrar detalles del proyecto en un modal
  showProjectDetails(projectId: number): void {
    console.log(`Mostrando detalles del proyecto: ${projectId}`);
    this.isLoading = true;

    // ✅ NUEVO: Obtener datos directamente de la grid
    const projectData = this.getProjectDataFromGrid(projectId);

    if (!projectData) {
      this.alertService.error(
        'No se pudo obtener la información del proyecto desde la tabla',
        'Error'
      );
      this.isLoading = false;
      return;
    }

    console.log('✅ Datos obtenidos directamente de la grid:', projectData);

    // ✅ EXTRAER INFORMACIÓN DIRECTAMENTE DE LA FILA
    const nombreArea = this.getAreaNameFromGridRow(projectData);
    const nombreCapitulo = this.getChapterNameFromGridRow(projectData);
    const nombreFinanciamiento = this.getFinancingNameFromGridRow(projectData);

    console.log('📊 Información extraída:');
    console.log('- Área:', nombreArea);
    console.log('- Capítulo:', nombreCapitulo);
    console.log('- Financiamiento:', nombreFinanciamiento);

    // 2. Cargar solo las requisiciones (datos que no están en la grid)
    this.historialService
      .getRequisitionsByProject(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Requisiciones cargadas:', response);

          // Calcular totales
          const totals = this.historialService.calculateRequisitionsTotals(
            response.requisitions || []
          );

          // Calcular porcentajes usando datos de la grid
          const porcentajeUtilizado =
            projectData.monto_asignado > 0
              ? (
                  (projectData.monto_utilizado / projectData.monto_asignado) *
                  100
                ).toFixed(1)
              : '0';

          const porcentajeDisponible =
            projectData.monto_asignado > 0
              ? (
                  (projectData.monto_disponible / projectData.monto_asignado) *
                  100
                ).toFixed(1)
              : '0';

          this.isLoading = false;

          // ✅ USAR DATOS EXTRAÍDOS DE LA GRID
          const modalRef = this.modalService.open(
            FormComponent,
            `Proyecto Anual ${projectData.año} - ${nombreArea}`,
            {
              data: projectData, // ✅ Usar datos de la grid
              requisitionsData: response.requisitions || [],
              metrics: response.metrics || {
                total_requisiciones: 0,
                total_pendientes: 0,
                total_aprobadas: 0,
              },
              resumen: {
                nombreArea: nombreArea, // ✅ Extraído de la grid
                nombreCapitulo: nombreCapitulo, // ✅ Extraído de la grid
                nombreFinanciamiento: nombreFinanciamiento, // ✅ Extraído de la grid
                porcentajeUtilizado,
                porcentajeDisponible,
                ...totals,
              },
              actualizar: this.loadHistorialData.bind(this)
            }
          );
          //modalRef.componentInstance.close = this.loadHistorialData.bind(this);

        },
        error: (error) => {
          console.error('Error al cargar requisiciones:', error);
          this.isLoading = false;

          // ✅ MODAL CON DATOS DE LA GRID AUNQUE FALLE LA CARGA DE REQUISICIONES
          this.modalService.open(
            FormComponent,
            `Proyecto Anual ${projectData.año} - ${nombreArea}`,
            {
              data: projectData,
              requisitionsData: [],
              hasError: true,
              errorMessage: 'No se pudieron cargar las requisiciones asociadas',
              resumen: {
                nombreArea: nombreArea,
                nombreCapitulo: nombreCapitulo,
                nombreFinanciamiento: nombreFinanciamiento,
              },
            }
          );
        },
      });
  }

  // ✅ NUEVO: Obtener datos del proyecto directamente de la grid
  private getProjectDataFromGrid(
    projectId: number
  ): HistorialPresupuesto | null {
    if (!this.gridApi) {
      console.error('Grid API no disponible');
      return null;
    }

    let foundProject: HistorialPresupuesto | null = null;

    // Iterar sobre todas las filas para encontrar el proyecto
    this.gridApi.forEachNode((node) => {
      if (node.data && node.data.id_proyecto_anual === projectId) {
        foundProject = node.data;
      }
    });

    if (!foundProject) {
      console.error(`No se encontró el proyecto ${projectId} en la grid`);
    }

    return foundProject;
  }

  // ✅ NUEVO: Extraer nombre del área desde los datos de la grid
  private getAreaNameFromGridRow(projectData: HistorialPresupuesto): string {
    console.log('🔍 Extrayendo nombre de área desde grid row...');
    console.log('Datos de área disponibles:', projectData?.dt_techo?.rl_area_financiero);

    // ✅ PRIORIDAD 1: Nombre completo del área
    if (projectData?.dt_techo?.rl_area_financiero?.ct_area?.nombre_area) {
      const nombreCompleto = projectData.dt_techo.rl_area_financiero.ct_area.nombre_area;
      //console.log(`✅ Usando nombre completo del área: "${nombreCompleto}"`);
      return nombreCompleto;
    }

    // ✅ PRIORIDAD 2: Nombre en relación financiera
    if (projectData?.dt_techo?.rl_area_financiero?.nombre) {
      const nombreRelacion = projectData.dt_techo.rl_area_financiero.nombre;
      //console.log(`✅ Usando nombre de relación financiera: "${nombreRelacion}"`);
      return nombreRelacion;
    }

    // ✅ FALLBACK: Si solo tenemos ct_area_id
    if (projectData?.dt_techo?.ct_area_id) {
      const areaId = projectData.dt_techo.ct_area_id;
      //console.log(`⚠️ Solo disponible ct_area_id: ${areaId}`);
      return `Área ID: ${areaId}`;
    }

    console.log('⚠️ No se encontró información de área en los datos de la grid');
    return 'Sin área';
  }

  // ✅ MEJORADO: Extraer nombre del capítulo desde los datos de la grid con manejo de clave_capitulo
  private getChapterNameFromGridRow(projectData: HistorialPresupuesto): string {
    console.log('🔍 Extrayendo nombre de capítulo desde grid row...');
    console.log(
      'Datos de capítulo disponibles:',
      projectData?.dt_techo?.ct_capitulo
    );

    // ✅ PRIORIDAD 1: Nombre completo del capítulo
    if (projectData?.dt_techo?.ct_capitulo?.nombre_capitulo) {
      const nombreCompleto = projectData.dt_techo.ct_capitulo.nombre_capitulo;
      console.log(
        `✅ Usando nombre completo del capítulo: "${nombreCompleto}"`
      );
      return nombreCompleto;
    }

    // ✅ PRIORIDAD 2: Construir con clave_capitulo (relación con ct_capitulo)
    if (projectData?.dt_techo?.ct_capitulo?.clave_capitulo) {
      const clave = projectData.dt_techo.ct_capitulo.clave_capitulo;
      const nombreConstruido = `Capítulo ${clave}`;
      console.log(
        `✅ Usando clave de capítulo: "${nombreConstruido}" (clave: ${clave})`
      );
      return nombreConstruido;
    }

    // ✅ FALLBACK: Si solo tenemos ct_capitulo_id
    if (projectData?.dt_techo?.ct_capitulo_id) {
      const capituloId = projectData.dt_techo.ct_capitulo_id;
      console.log(`⚠️ Solo disponible ct_capitulo_id: ${capituloId}`);
      return `Capítulo ID: ${capituloId}`;
    }

    console.log(
      '⚠️ No se encontró información de capítulo en los datos de la grid'
    );
    return 'Sin capítulo';
  }

  // ✅ NUEVO: Extraer nombre del financiamiento desde los datos de la grid
  private getFinancingNameFromGridRow(
    projectData: HistorialPresupuesto
  ): string {
    if (projectData?.dt_techo?.ct_financiamiento?.nombre_financiamiento) {
      return projectData.dt_techo.ct_financiamiento.nombre_financiamiento;
    }

    return 'Sin financiamiento';
  }

  // Exportar proyecto a Excel
  exportProjectToExcel(projectId: number): void {
    console.log(`Exportando proyecto ${projectId} a Excel`);
    this.alertService.success(
      `Exportación del proyecto ${projectId} iniciada`,
      'Exportar'
    );
    // Implementación de exportación a Excel (pendiente)
  }

  exportProjectToPDF(projectId: number,area:string): void {
    console.log("USUARIO: ",this.user.curp)
    console.log(`Exportando proyecto ${projectId} a PDF`);
    this.isLoading = true;
    this.historialService.descargarPdf(projectId,area,this.user.curp).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `requisicion_compra.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al descargar PDF:', err);
        this.alertService.error('Error al exportar PDF', 'Verifique el servidor');
        this.isLoading = false;
      }
    });

  }

  // Formatear fecha
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  // Formatear moneda
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount || 0);
  }
}
