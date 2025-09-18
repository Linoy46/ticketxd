/**
 * @file budgets.component.ts
 * @description Componente principal para la gestión de presupuestos y fuentes de financiamiento
 * (Optimizado para concentrar la lógica de negocio en el servicio)
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import {
  BudgetItem,
  UnidadAdministrativa,
  FuenteFinanciamiento,
  ColDef,
} from './interfaces/budgets.interface';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import { localeText } from '../../../core/helpers/localText';
import { BudgetsService } from './services/budgets.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';
import { BudgetService } from '../budget.ceiling/services/budget.service';
import { TutorialComponent } from '../../../shared/tutorial/tutorial.component';
import { TutorialConfig } from '../../../core/services/tutorial.service';
import * as jwt_decode from 'jwt-decode';
import { HttpClient } from '@angular/common/http';

// Registrar los módulos de ag-Grid
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule, // Asegúrate de importar RouterModule
    NgbDropdownModule,
    NgbNavModule, // Importa NgbNavModule para las pestañas
    AgGridAngular,
    SharedCustomModalComponent,
    TutorialComponent,
  ],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.scss',
})
export class BudgetsComponent implements OnInit, OnDestroy {
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );

  get user() {
    return this.userSelector();
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

  // Control de suscripciones
  private destroy$ = new Subject<void>();

  // Estado de carga
  isLoading = false;
  loadingError: string | null = null;

  // Filtros y términos de búsqueda
  searchTerm = '';
  selectedUnidad: string = '';
  selectedFuente: string = '';
  activeTab = 'presupuesto';

  // Propiedades para la pestaña Archivos
  selectedUnidadAdministrativa: string = '';
  unidadesAdministrativas: any[] = [];

  // Propiedades para el autocompletado
  searchUnidad: string = '';
  filteredUnidades: any[] = [];
  showDropdown: boolean = false;
  areaSeleccionada: boolean = false;

  // Propiedades para el tipo de usuario
  userType: string = '';
  userInfo: string = '';

  // Configuración de AG Grid
  myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });

  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 25, 50];
  // Datos para la visualización
  filteredBudgets: BudgetItem[] = [];
  columnDefs: ColDef[] = [];

  // AG Grid API
  private gridApi!: GridApi;

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
      wrapText: false, // Permitir wrap de texto
      autoHeight: false, // Ajustar altura automáticamente
    },
    localeText: localeText,
    floatingFilter: true,
    animateRows: false,
    suppressCellFlash: true,
    enableCellChangeFlash: false,
    suppressRowHoverHighlight: true,
    suppressRowTransform: true,
    suppressMovableColumns: true,
    suppressColumnVirtualisation: true,
    suppressRowVirtualisation: false,
    rowBuffer: 100,
    immutableData: true,
    immutableColumns: true,
    getRowNodeId: (data: any) => data.clave.toString(),
    suppressPropertyNamesCheck: true,
    suppressColumnStateEvents: true,
    suppressClickEdit: true,
    // Aumentar la altura de las filas para mejorar la legibilidad
    rowHeight: 40,
    // Aumentar la altura del encabezado
    headerHeight: 48,
  };
  alertService: any;
  onCellClicked: any;

  budgetsData: any[] = [];
  filteredData: any[] = [];

  //* Configuración del tutorial
  tutorialConfig: TutorialConfig = {
    steps: [
      {
        title: 'Navegación de pestañas',
        element: '#nav-tabs',
        intro:
          'Aquí puedes navegar entre la gestión de presupuestos y el historial.',
        position: 'bottom',
      },
      {
        title: 'Nuevo Techo Presupuestal',
        element: '#nuevo_techo',
        intro: 'Haz clic aquí para crear un nuevo techo presupuestal.',
        position: 'left',
      },
      {
        title: 'Tabla de presupuestos',
        element: '#tabla_techos',
        intro:
          'Esta tabla muestra todos los techos presupuestales disponibles con información detallada.',
        position: 'top',
      },
      {
        title: 'Filtros de búsqueda',
        element: '.ag-icon-filter',
        intro:
          'Utiliza estos filtros en cada columna para buscar presupuestos específicos en el apartado de ID info, Área, Capítulo o Financiamiento.',
        position: 'bottom',
      },
      {
        title: 'Exportar individual',
        element: '#req',
        intro: 'Aquí podras agregar productos a un presupuesto.',
        position: 'right',
      },
      {
        title: 'Exportar individual',
        element: '#excel',
        intro:
          'Exporta el formato de costeo por articulo, capítulo, unidad administrativa y gente de financiamiento individualmente.',
        position: 'right',
      },
      {
        title: 'Exportar Detallado',
        element: '#detallado',
        intro:
          'Exporta el formato de costeo por articulo, capítulo, unidad administrativa y gente de financiamiento.',
        position: 'right',
      },
    ],
    onComplete: () => {
      console.log('Tutorial completado en presupuestos');
    },
    onExit: () => {
      console.log('Tutorial cerrado en presupuestos');
    },
  };

  mostrarSelectArea: boolean = false;

  constructor(
    private modalService: CoreModalService,
    private budgetsService: BudgetsService,
    private router: Router,
    private budgetService: BudgetService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    // ✅ CORRECCIÓN: Obtener definiciones de columnas desde el servicio
    const allColumns = this.budgetsService.getColumnDefs();
    // Filtrar para excluir las columnas que no queremos mostrar
    this.columnDefs = allColumns.filter(
      (col: any) => col.field !== 'utilizado' && col.field !== 'diferencia'
    );

    // Iniciar suscripción a datos filtrados
    this.budgetsService.filteredBudgets$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: BudgetItem[]) => {
        console.log(
          'Recibiendo datos actualizados en el componente:',
          data.length
        );
        this.ngZone.run(() => {
          console.log('VERIFICAR ERROR: Datos recibidos en budgets', data);
          this.filteredBudgets = [...data];
          console.log(
            'VERIFICAR ERROR: filteredBudgets asignado',
            this.filteredBudgets
          );
          console.log('VERIFICAR ERROR: gridApi disponible', this.gridApi);
          this.cdr.detectChanges();
          console.log('VERIFICAR ERROR: detectChanges llamado');
          if (this.gridApi && data.length > 0) {
            this.budgetsService.updateGridData(this.gridApi, data);
            console.log('VERIFICAR ERROR: updateGridData ejecutado');
          }
        });
      });
  }
  ngOnDestroy(): void {
    // ✅ RESTAURAR: Limpiar el manejador global
    document.removeEventListener('click', this.handleGlobalClick.bind(this));

    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    // Ajuste para móviles
    if (window.innerWidth <= 900) {
      if (this.columnDefs) {
        this.columnDefs = this.columnDefs.map((col) => ({
          ...col,
          minWidth: 110,
          flex: 1,
        }));
      }
    }
    // Ajuste para tablets
    if (window.innerWidth > 767 && window.innerWidth <= 1024) {
      if (this.columnDefs) {
        this.columnDefs = this.columnDefs.map((col) => ({
          ...col,
          minWidth: 200,
          flex: 1,
        }));
      }
    }
    this.determineUserType();
    this.loadUnidadesAdministrativas();
    this.filteredUnidades = [...this.unidadesAdministrativas]; // Inicializar filtrado
    this.loadData();
    // ✅ RESTAURAR: Configurar manejador global de eventos para botones
    this.setupGlobalButtonHandler();
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded: any = (jwt_decode as any)(token);
        // Suponiendo que los puestos están en decoded.puestos o similar
        // Ajusta la propiedad según tu JWT
        const puestos: number[] = decoded.puestos || [];
        this.mostrarSelectArea =
          puestos.includes(1806) || puestos.includes(258);
      } catch (e) {
        this.mostrarSelectArea = false;
      }
    }
  }

  /**
   * ✅ CORRECCIÓN: Cargar datos usando el método correcto
   */
  private loadData(): void {
    this.isLoading = true;

    this.budgetsService
      .loadAllBudgetData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (mappedData: BudgetItem[]) => {
          console.log('✅ Datos cargados correctamente:', mappedData.length);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('❌ Error al cargar datos:', error);
          this.isLoading = false;
        },
      });
  }

  /**
   * ✅ CORRECCIÓN: Exportar a Excel
   */

  /**
   * ✅ CORRECCIÓN: Exportar individual a Excel
   */
  exportIndividualToExcel(itemId: number): void {
    this.budgetsService.exportIndividualToExcel(itemId).subscribe({
      next: () => {
        console.log('✅ Exportación individual completada');
      },
      error: (error: any) => {
        console.error('❌ Error en exportación individual:', error);
      },
    });
  }

  /**
   * ✅ CORRECCIÓN: Exportar detallado a Excel
   */
  exportDetailedToExcel(): void {
    this.budgetsService.exportDetailedToExcel().subscribe({
      next: () => {
        console.log('✅ Exportación detallada completada');
      },
      error: (error: any) => {
        console.error('❌ Error en exportación detallada:', error);
      },
    });
  }

  /**
   * ✅ RESTAURAR: Configurar el manejador global de eventos para botones
   */
  private setupGlobalButtonHandler(): void {
    // Usar un delegado de eventos global para manejar clics en los botones
    document.addEventListener('click', this.handleGlobalClick.bind(this));
  }

  // ✅ RESTAURAR: Manejador global de eventos para los botones dentro de AG Grid
  private handleGlobalClick(event: MouseEvent): void {
    const gridContainer = document.querySelector('.ag-center-cols-container');
    if (!gridContainer?.contains(event.target as Node)) return;

    const targetElement = event.target as HTMLElement;
    const buttonElement = targetElement.closest('button');
    if (!buttonElement) return;

    const rowElement = buttonElement.closest('.ag-row');
    if (!rowElement) return;

    const rowIndex = rowElement.getAttribute('row-index');
    if (rowIndex === null || rowIndex === undefined) return;

    // Obtener los datos de la fila
    const rowNode = this.gridApi.getDisplayedRowAtIndex(parseInt(rowIndex));
    if (!rowNode) return;

    const action = buttonElement.getAttribute('data-action');
    const itemId = buttonElement.getAttribute('data-id');

    // Prevenir propagación del evento
    event.preventDefault();
    event.stopPropagation();

    console.log(`Acción: ${action}, ID: ${itemId}`);

    // Ejecutar la acción correspondiente
    switch (action) {
      case 'products':
        this.openProductsDialog(rowNode.data);
        break;
      case 'export-individual':
        this.exportIndividualRecord(rowNode.data);
        break;
      case 'export-detailed':
        this.exportDetailedRecord(rowNode.data);
        break;
      default:
        console.warn('Acción no reconocida:', action);
    }
  }

  // Método para abrir el diálogo de productos
  openProductsDialog(budgetItem: BudgetItem): void {
    console.log('🚀 APERTURA DE PRODUCTOS DIALOG');
    console.log('📊 Budget Item enviado desde ag-Grid:', {
      idTecho: budgetItem?.idTecho,
      tipoIdTecho: typeof budgetItem?.idTecho,
      unidad: budgetItem?.unidad,
      presupuestado: budgetItem?.presupuestado,
      todasLasPropiedades: Object.keys(budgetItem || {}),
    });

    if (!budgetItem) {
      this.alertService.error(
        'Error: No hay datos de presupuesto para procesar'
      );
      return;
    }

    // ✅ VALIDACIÓN MEJORADA: Verificar que idTecho existe y es válido
    if (!budgetItem.idTecho || budgetItem.idTecho <= 0) {
      console.error('❌ TECHO PRESUPUESTAL FALTANTE O INVÁLIDO EN AG-GRID');
      console.error('Budget Item completo recibido:', budgetItem);

      // ✅ VERIFICAR PROPIEDADES ALTERNATIVAS EN EL OBJETO DE AG-GRID
      const propiedadesAlternativas = ['id_techo', 'techo_id', 'techoId'];
      let techoEncontrado = false;

      for (const prop of propiedadesAlternativas) {
        if (budgetItem[prop] && budgetItem[prop] > 0) {
          console.log(
            `✅ Techo encontrado en propiedad '${prop}':`,
            budgetItem[prop]
          );
          budgetItem.idTecho = Number(budgetItem[prop]);
          techoEncontrado = true;
          break;
        }
      }

      if (!techoEncontrado) {
        console.error(
          '❌ No se encontró idTecho en ninguna propiedad del objeto ag-Grid'
        );
        this.alertService.error(
          'Error crítico: El presupuesto seleccionado no tiene un techo presupuestal válido. ' +
            'Esto indica un problema en la configuración de datos de la tabla. ' +
            'Contacte al administrador del sistema.',
          'Error de datos'
        );
        return;
      }
    }

    console.log(
      `✅ TECHO PRESUPUESTAL VALIDADO PARA ENVÍO: ${budgetItem.idTecho}`
    );

    // ✅ NAVEGACIÓN CON DATOS VALIDADOS
    console.log('🚀 Navegando con budgetItem validado:', {
      idTecho: budgetItem.idTecho,
      unidad: budgetItem.unidad,
      presupuestado: budgetItem.presupuestado,
    });

    this.router
      .navigate(['/promette/budget-products'], {
        state: { budgetItem },
      })
      .then(() => {
        console.log('✅ Navegación realizada con éxito');
      })
      .catch((err) => {
        console.error('❌ Error al realizar la navegación:', err);
        this.alertService.error('Error al abrir el módulo de productos');
      });
  }

  // Método para cargar los techos presupuestales con información de utilización
  loadBudgetCeilings() {
    this.isLoading = true;
    this.loadingError = null;

    console.log('Iniciando carga de techos presupuestales con mapeo de áreas');

    // ✅ CORRECCIÓN: Usar loadAllBudgetData() que retorna Observable
    this.budgetsService
      .loadAllBudgetData()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (mappedData: BudgetItem[]) => {
          console.log('✅ Datos cargados y transformados:', mappedData.length);
          this.filteredBudgets = mappedData;

          if (this.gridApi) {
            this.budgetsService.updateGridData(this.gridApi, mappedData);
          }
        },
        error: (error: any) => {
          console.error('❌ Error al cargar datos:', error);
          this.loadingError =
            'Error al cargar los datos presupuestales: ' +
            (error.message || 'Error desconocido');
        },
      });
  }

  // Manejadores para filtros y búsqueda
  onSearchChange() {
    this.budgetsService.applyFilters(this.searchTerm);
  }
  // Método para capturar la API de la grid cuando esté lista
  onGridReady(params: GridReadyEvent): void {
    console.log('Grid lista para recibir datos');
    this.gridApi = params.api;

    // Solo actualizamos la grid si ya tenemos datos
    if (this.filteredBudgets.length > 0) {
      try {
        this.gridApi.setGridOption('rowData', this.filteredBudgets);
        console.log('Grid actualizada con datos existentes');
      } catch (error) {
        console.error(
          'Error al actualizar la grid con datos existentes:',
          error
        );
      }
    }
  }
  // Nuevo método para navegar a la página de techo presupuestal
  navigateToBudgetCeiling(): void {
    this.router.navigate(['/promette/budget-ceiling']); // Ruta según layoutRoutes
  }
  /**
   * Exporta los datos actuales a Excel
   */
  exportToExcel(): void {
    if (this.filteredBudgets.length === 0) {
      console.warn('No hay datos para exportar');
      return;
    }

    this.budgetsService.exportToExcel().subscribe({
      next: (blob: Blob) => {
        // Crear enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Generar nombre de archivo con fecha
        const now = new Date();
        const dateStr =
          now.getFullYear() +
          '-' +
          String(now.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(now.getDate()).padStart(2, '0');
        link.download = `techos_presupuestales_${dateStr}.xlsx`;

        // Descargar archivo
        document.body.appendChild(link);
        link.click();

        // Limpiar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('Exportación a Excel completada');
      },
      error: (error) => {
        console.error('Error al exportar a Excel:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      },
    });
  }
  /**
   * Exporta un registro individual a Excel
   */
  exportIndividualRecord(budgetItem: BudgetItem): void {
    if (!budgetItem || !budgetItem.idTecho) {
      console.error('No se puede exportar: datos de registro inválidos');
      return;
    }

    console.log('Exportando registro individual:', budgetItem.unidad);

    this.budgetsService.exportIndividualToExcel(budgetItem.idTecho).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Nombre de archivo específico para el registro
        const fileName = `techo_presupuestal_${budgetItem.unidad.replace(
          /\s+/g,
          '_'
        )}_${new Date().getFullYear()}.xlsx`;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('Exportación individual completada');
      },
      error: (error) => {
        console.error('Error al exportar registro individual:', error);
      },
    });
  }
  /**
   * Exporta el detalle completo de un registro a Excel
   */
  exportDetailedRecord(budgetItem: BudgetItem): void {
    if (!budgetItem || !budgetItem.idTecho) {
      console.error(
        'No se puede exportar detalle: datos de registro inválidos'
      );
      return;
    }

    console.log('Exportando detalle completo:', budgetItem.unidad);

    this.budgetsService.exportDetailedToExcel().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Nombre de archivo específico para el detalle
        const fileName = `detalle_presupuestal_${budgetItem.unidad.replace(
          /\s+/g,
          '_'
        )}_${new Date().getFullYear()}.xlsx`;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('Exportación detallada completada');
      },
      error: (error) => {
        console.error('Error al exportar detalle completo:', error);
      },
    });
  }

  /**
   * Exporta el costeo por artículo a Excel
   */
  exportCosteoArticulo(): void {
    console.log('Exportando costeo por artículo...');

    // Si hay una unidad administrativa seleccionada, usarla
    const params = this.selectedUnidadAdministrativa
      ? { unidadAdministrativa: this.selectedUnidadAdministrativa }
      : {};

    this.budgetsService.exportCosteoArticuloExcel(params).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Nombre de archivo específico para el costeo por artículo
        const fileName = `costeo_por_articulo_${new Date().getFullYear()}.xlsx`;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('Exportación de costeo por artículo completada');
      },
      error: (error) => {
        console.error('Error al exportar costeo por artículo:', error);
      },
    });
  }

  /**
   * Determina el tipo de usuario y su información
   */
  determineUserType(): void {
    const userPuestos = this.user.rl_usuario_puestos as {
      ct_puesto_id: number;
    }[];

    // Verificar si es usuario 1806 (jefe financiero)
    const isFinancialHead = userPuestos.some(
      (puesto) => puesto.ct_puesto_id === 1806
    );

    // Verificar si es analista
    const isAnalyst = userPuestos.some((puesto) => puesto.ct_puesto_id === 258);

    if (isFinancialHead) {
      this.userType = 'Jefe Financiero';
      this.userInfo =
        'Puede ver y descargar archivos de todas las unidades administrativas';
    } else if (isAnalyst) {
      this.userType = 'Analista';
      this.userInfo =
        'Puede ver y descargar archivos de las unidades que le fueron asignadas';
    } else {
      this.userType = 'Usuario Normal';
      this.userInfo = 'Puede ver y descargar archivos solo de su área asignada';
    }

    console.log(`👤 Tipo de usuario: ${this.userType}`);
    console.log(`ℹ️ Información: ${this.userInfo}`);
  }

  /**
   * Carga las unidades administrativas desde el backend
   */
  loadUnidadesAdministrativas(): void {
    this.budgetsService.getUnidadesAdministrativas().subscribe({
      next: (data) => {
        console.log('Unidades administrativas cargadas:', data);
        this.unidadesAdministrativas = data.projects || [];
        this.filteredUnidades = [...this.unidadesAdministrativas]; // Actualizar filtrado

        // Mostrar información sobre las unidades cargadas
        if (this.unidadesAdministrativas.length === 0) {
          console.warn(
            '⚠️ No se encontraron unidades administrativas para este usuario'
          );
        } else {
          console.log(
            `✅ Se cargaron ${this.unidadesAdministrativas.length} unidades administrativas`
          );
          console.log(
            '📋 Unidades disponibles:',
            this.unidadesAdministrativas.map(
              (u) => `${u.id_proyecto_anual} - ${u.descripcion}`
            )
          );
        }
      },
      error: (error) => {
        console.error('Error al cargar unidades administrativas:', error);
        this.unidadesAdministrativas = [];
        this.filteredUnidades = [];
      },
    });
  }

  /**
   * Maneja el cambio de unidad administrativa seleccionada
   */
  onUnidadChange(): void {
    console.log(
      'Unidad administrativa seleccionada:',
      this.selectedUnidadAdministrativa
    );
    // Aquí puedes agregar lógica adicional cuando cambie la selección
  }

  /**
   * Filtra las unidades administrativas según el texto de búsqueda
   */
  filterUnidades(): void {
    if (!this.searchUnidad.trim()) {
      this.filteredUnidades = [...this.unidadesAdministrativas];
    } else {
      const searchTerm = this.searchUnidad.toLowerCase();
      this.filteredUnidades = this.unidadesAdministrativas.filter(
        (unidad) =>
          unidad.id_proyecto_anual.toString().includes(searchTerm) ||
          unidad.descripcion.toLowerCase().includes(searchTerm)
      );
    }
  }

  /**
   * Selecciona una unidad del dropdown
   */
  selectUnidad(unidad: any): void {
    this.selectedUnidadAdministrativa = unidad.id_proyecto_anual;
    this.searchUnidad = `${unidad.id_proyecto_anual} - ${unidad.descripcion}`;
    this.showDropdown = false;
    this.areaSeleccionada = false; // Resetear estado de área seleccionada
  }

  /**
   * Obtiene el nombre de la unidad seleccionada
   */
  getSelectedUnidadName(): string {
    const unidad = this.unidadesAdministrativas.find(
      (u) => u.id_proyecto_anual === this.selectedUnidadAdministrativa
    );
    return unidad ? `${unidad.id_proyecto_anual} - ${unidad.descripcion}` : '';
  }

  /**
   * Maneja el evento blur del input
   */
  onBlur(): void {
    // Pequeño delay para permitir que el click en el dropdown funcione
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  /**
   * Alterna la visibilidad del dropdown
   */
  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.filterUnidades();
    }
  }

  /**
   * Confirma la selección del área
   */
  seleccionarArea(): void {
    this.areaSeleccionada = true;
    const unidadSeleccionada = this.unidadesAdministrativas.find(
      (u) => u.id_proyecto_anual === this.selectedUnidadAdministrativa
    );
    console.log('✅ Área seleccionada:', this.selectedUnidadAdministrativa);
    console.log('📋 Información de la unidad:', unidadSeleccionada);

    // Mostrar mensaje de confirmación
    if (unidadSeleccionada) {
      console.log(
        `🎯 Unidad seleccionada: ${unidadSeleccionada.id_proyecto_anual} - ${unidadSeleccionada.descripcion}`
      );
    }
  }

  /**
   * Limpia la selección actual
   */
  limpiarSeleccion(): void {
    this.selectedUnidadAdministrativa = '';
    this.searchUnidad = '';
    this.areaSeleccionada = false;
    this.showDropdown = false;
    this.filteredUnidades = [];
  }

  /**
   * Exporta el costeo por partida
   */
  exportCosteoPartida(): void {
    console.log('Exportando costeo por partida...');
    // TODO: Implementar exportación de costeo por partida
    alert('Funcionalidad de costeo por partida en desarrollo');
  }

  /**
   * Exporta el desglose de concepto por partida
   */
  exportDesglosePartida(): void {
    console.log('Exportando desglose de concepto por partida...');
    // Obtener el puesto activo del usuario
    const puestoActivo = this.user.rl_usuario_puestos?.find(
      (p: any) => !p.periodo_final
    );
    const ct_area_id = puestoActivo?.ct_puesto?.ct_area_id; // área de infraestructura
    if (!ct_area_id) {
      alert('No se encontró el área de infraestructura del puesto activo.');
      return;
    }
    // Llamar a la API para obtener el área financiera correspondiente
    this.http
      .get<any>(
        `/app/promette/api/budget/area-financiero/by-infra/${ct_area_id}`
      )
      .subscribe({
        next: (response) => {
          console.log('Respuesta de area-financiero/by-infra:', response);
          // Buscar el id_area_fin en la respuesta
          const id_area_fin = response?.results?.[0]?.id_area_fin;
          if (!id_area_fin) {
            alert(
              'No se encontró el área financiera correspondiente a la unidad seleccionada.'
            );
            return;
          }
          // Mostrar la información obtenida
          alert(
            'Área financiera encontrada: ' + JSON.stringify(response.results[0])
          );
          // Preparar el body para la exportación de justificaciones
          const body = { ct_area_id: id_area_fin };
          // Llamar al endpoint de justificacion-partida y descargar el archivo
          // Usar la variable de entorno para la URL base de Promette
          const prometeApiBase = (window as any)?.env?.PROMETTE_API || '';
          this.http
            .post(`${prometeApiBase}/api/excel/justificacion-partida`, body, {
              responseType: 'blob',
            })
            .subscribe({
              next: (blob: Blob) => {
                if (!blob || blob.size === 0) {
                  alert('Archivo vacío');
                  return;
                }
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Justificacion_Partida.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              },
              error: (err) => {
                alert(
                  'Error al descargar el archivo de justificación: ' +
                    err.message
                );
              },
            });
        },
        error: (err) => {
          alert('Error al obtener el área financiera: ' + err.message);
        },
      });
  }

  /**
   * Exporta la requisición mensual
   */
  exportRequisicionMensual(): void {
    console.log('Exportando requisición mensual...');
    // TODO: Implementar exportación de requisición mensual
    alert('Funcionalidad de requisición mensual en desarrollo');
  }

  /**
   * Obtiene el estilo para la celda de diferencia según el valor
   * Mejoramos el cálculo de la clase para visualización
   */
  getDifferenceCellClass(params: any): string {
    if (params.value === undefined || params.value === null) return '';

    const value = params.value;
    // Si la diferencia es negativa, mostrar en rojo (hemos sobrepasado el presupuesto)
    if (value < 0) {
      return 'text-end text-danger fw-bold';
    }
    // Si la diferencia es menor al 10% del techo, mostrar en amarillo (alerta)
    else if (value < params.data.techo * 0.1) {
      return 'text-end text-warning fw-bold';
    }
    // En otro caso, todo bien (verde)
    return 'text-end text-success';
  }
}
