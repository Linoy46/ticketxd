import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import { localeText } from '../../../core/helpers/localText';
import { FinancingService } from './services/financing.service';
import { Subject } from 'rxjs';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';
import { TutorialComponent } from '../../../shared/tutorial/tutorial.component';
import { TutorialConfig } from '../../../core/services/tutorial.service';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';
import { FormComponent } from './form/form.component';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { FinancingItem } from './interfaces/financing.interface';
import { AuthLoginService } from '../../../main/auth/services/auth.login.service';
import { effect } from '@angular/core';

// Registrar módulos de ag-Grid
ModuleRegistry.registerModules([AllCommunityModule]);

interface User {
  id: number;
  name: string;
  email: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-financing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbDropdownModule,
    NgbNavModule,
    AgGridAngular,
    SharedCustomModalComponent,
    SharedActionsGridComponent,
    FormComponent,
    TutorialComponent,
  ],
  providers: [AuthLoginService],
  templateUrl: './financing.component.html',
  styleUrl: './financing.component.scss',
})
export class FinancingComponent implements OnInit, OnDestroy {
  // Variables para datos
  financingData: FinancingItem[] = [];
  filteredFinancingData: FinancingItem[] = [];
  private destroy$ = new Subject<void>();

  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );

  get user() {
    return this.userSelector();
  }

  private permissionsSelector = injectSelector<RootState, any>(
    (state) => state.auth.permissions
  );

  get permissions() {
    return this.permissionsSelector(); // Se actualiza automáticamente
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  // Filtros
  searchTerm: string = '';
  selectedType: string = '';
  selectedStatus: string = '';

  // ag-Grid
  private gridApi!: GridApi<FinancingItem>;

  //* Configuración del tutorial
  tutorialConfig: TutorialConfig = {
    steps: [
      {
        title: 'Nuevo Financiamiento',
        element: '#nuevo_fnanciamiento',
        intro: 'Haz clic aquí para crear un nuevo financiamiento.',
        position: 'bottom',
      },
      {
        title: 'Tabla de financiamientos',
        element: 'ag-grid-angular',
        intro:
          'Esta tabla muestra todos los financiamientos con información detallada.',
        position: 'top',
      },
      {
        title: 'Filtros de búsqueda',
        element: '.ag-icon-filter',
        intro: 'Utiliza estos filtros para buscar financiamientos específicos.',
        position: 'bottom',
      },
      {
        title: 'Estado del registro',
        element: '#estado',
        intro:
          'Indica el estado del financiamiento (<small class="text-success">Activo</small> o <small class="text-danger">Inactivo</small>).',
        position: 'left',
      },
      {
        title: 'Editar financiamiento',
        element: '#editar',
        intro:
          'Aquí podrás editar la información del financiamiento seleccionado.',
        position: 'left',
      },
      {
        title: 'Eliminar financiamiento',
        element: '#eliminar',
        intro: 'Aquí podrás eliminar el financiamiento seleccionado',
        position: 'left',
      },
      {
        title: 'Exportar a Excel',
        element: '#excel',
        intro:
          'Podrás exportar la información del financiamiento seleccionado.',
        position: 'left',
      },
    ],
    onComplete: () => {
      console.log('Tutorial completado en financiamientos');
    },
    onExit: () => {
      console.log('Tutorial cerrado en financiamientos');
    },
  };

  // Tema personalizado para AG Grid
  myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });

  gridOptions = {
    defaultColDef: {
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
      minWidth: 100,
    },
    localeText: localeText,
    floatingFilter: false,
    animateRows: true,
    components: { actionsCellRenderer: SharedActionsGridComponent },
  };

  // Definición de columnas
  columnDefs: ColDef[] = [
    {
      field: 'id_financiamiento',
      headerName: 'ID',
      maxWidth: 100,
    },
    {
      field: 'nombre_financiamiento',
      headerName: 'Financiamiento',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'estado',
      headerName: 'Estado',
      cellRenderer: (params: any) => {
        const estadoValue = params.value;
        const isActive = estadoValue === 1 || estadoValue === true;
        const estado = isActive ? 'Activo' : 'Inactivo';
        const badgeClass = isActive ? 'bg-success' : 'bg-danger';

        return `<span id="estado" class="badge ${badgeClass}">${estado}</span>`;
      },
      maxWidth: 120,
    },
    ...(this.hasPermission('Financieros:view_actions')
      ? [
          {
            headerName: 'Acciones',
            filter: false,
            sortable: false,
            cellRenderer: SharedActionsGridComponent,
            cellRendererParams: {
              onEdit: this.openEditDialog.bind(this),
              onDelete: this.openDeleteDialog.bind(this),
            },
            maxWidth: 120,
            minWidth: 100,
          },
          {
            field: 'actions',
            headerName: 'Excel',
            cellStyle: { textAlign: 'center' },
            cellRenderer: SharedActionsGridComponent,
            cellRendererParams: {
              onExcel: this.excel.bind(this),
            },
            flex: 1,
            maxWidth: 120,
          },
        ]
      : []),
  ];

  areas: any[] = [];

  constructor(
    private financingService: FinancingService,
    private modalService: CoreModalService,
    private alertService: CoreAlertService,
    private cdr: ChangeDetectorRef
  ) {
    // Usar effect para reaccionar a los cambios del usuario
    effect(() => {
      const user = this.user;
      if (user) {
        this.loadFinancingData();
      }
    });
  }

  ngOnInit() {
    if (window.innerWidth <= 900) {
      this.columnDefs = this.columnDefs.map((col) => ({
        ...col,
        minWidth: 120,
        flex: 1,
      }));
    }
    // Inicialización adicional si es necesaria
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Cargar datos de financiamiento desde el servicio
  loadFinancingData(): void {
    const user = this.user;
    if (!user || !user.id_usuario) {
      console.log('Usuario no disponible, esperando...');
      // Si el usuario no está disponible, esperar un poco y reintentar
      setTimeout(() => {
        this.loadFinancingData();
      }, 1000);
      return;
    }

    // Verificar si el usuario tiene el puesto de jefe (1806)
    const userPuestos = user.rl_usuario_puestos as { ct_puesto_id: number }[];
    const isJefe =
      userPuestos?.some((puesto) => puesto.ct_puesto_id === 1806) || false;
    const isAnalyst =
      userPuestos?.some((puesto) => puesto.ct_puesto_id === 258) || false;

    console.log('Estado del usuario:', {
      isJefe,
      isAnalyst,
      userId: user.id_usuario,
    });

    // Usar el ID del usuario para la petición (el backend ahora maneja la autenticación por token)
    this.financingService.getFinancingItems(user.id_usuario).subscribe({
      next: (response) => {
        // El backend ya maneja el filtrado por puestos y áreas
        this.filteredFinancingData = response.financiamientos || [];
        console.log(
          'Financiamientos cargados:',
          this.filteredFinancingData.length
        );
        this.cdr.detectChanges();

        // Mostrar información del filtro aplicado si está disponible
        if (response.filtro_aplicado) {
          console.log('Filtro aplicado:', response.filtro_aplicado);
        }
      },
      error: (error) => {
        console.error('Error al cargar los financiamientos:', error);
        this.alertService.error('Error al cargar los datos de financiamiento');
      },
    });
  }

  onGridReady(params: GridReadyEvent<FinancingItem>): void {
    this.gridApi = params.api;
  }

  // Abrir modal para agregar financiamiento
  openAddDialog(): void {
    const newItem: FinancingItem = {
      nombre_financiamiento: '',
      estado: 1,
    };

    this.modalService.open(FormComponent, 'Agregar Nuevo Financiamiento', {
      item: newItem,
      onSave: (savedItem: FinancingItem) => this.handleAddFinancing(savedItem),
    });
  }

  // Abrir modal para editar financiamiento
  openEditDialog(item: FinancingItem): void {
    this.modalService.open(FormComponent, 'Editar Financiamiento', {
      item: { ...item },
      onSave: (updatedItem: FinancingItem) =>
        this.handleEditFinancing(updatedItem),
    });
  }

  // Abrir modal de confirmación para eliminar financiamiento
  openDeleteDialog(item: FinancingItem): void {
    this.alertService
      .confirm(
        `¿Está seguro que desea eliminar el financiamiento "${item.nombre_financiamiento}"?`,
        'Eliminar Financiamiento'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.handleDeleteFinancing(item.id_financiamiento!);
        }
      });
  }

  // Añadir nuevo financiamiento
  handleAddFinancing(item: FinancingItem): void {
    this.financingService.createFinancingItem(item).subscribe({
      next: (response) => {
        this.alertService.success(
          response.msg || 'Financiamiento creado exitosamente'
        );
        this.loadFinancingData();
      },
      error: (error) => {
        console.error('Error al crear financiamiento:', error);
        this.alertService.error(
          error.error?.msg || 'Error al crear el financiamiento'
        );
      },
    });
  }

  // Manejar la edición de un financiamiento
  handleEditFinancing(item: FinancingItem): void {
    this.financingService.updateFinancingItem(item).subscribe({
      next: (response) => {
        this.alertService.success(
          response.msg || 'Financiamiento actualizado exitosamente'
        );
        this.loadFinancingData();
      },
      error: (error) => {
        console.error('Error al actualizar financiamiento:', error);
        this.alertService.error(
          error.error?.msg || 'Error al actualizar el financiamiento'
        );
      },
    });
  }

  // Manejar la eliminación de un financiamiento
  handleDeleteFinancing(id_financiamiento: number): void {
    this.financingService.deleteFinancingItem(id_financiamiento).subscribe({
      next: (response) => {
        this.alertService.success(
          response.msg || 'Financiamiento eliminado exitosamente'
        );
        this.loadFinancingData();
      },
      error: (error) => {
        console.error('Error al eliminar financiamiento:', error);
        this.alertService.error(
          error.error?.msg || 'Error al eliminar el financiamiento'
        );
      },
    });
  }

  //Descargar documento excel
  excel() {
    console.log('descargando excel');
  }
}
