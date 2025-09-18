import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';
import { localeText } from '../../../core/helpers/localText';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { BudgetService } from './services/budget.service';
import {
  BudgetCeilingViewModel,
  BudgetCeiling,
} from './interfaces/budget.interfaces';
import { Subscription } from 'rxjs';
import { FormComponent } from './form/form.component';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';
import { TutorialComponent } from '../../../shared/tutorial/tutorial.component';
import { TutorialConfig } from '../../../core/services/tutorial.service';

// Registrar módulos ag-Grid
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-budget.ceiling',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridAngular,
    SharedCustomModalComponent,
    SharedActionsGridComponent,
    TutorialComponent,
  ],
  templateUrl: './budget.ceiling.component.html',
  styleUrl: './budget.ceiling.component.scss',
})
export class BudgetCeilingComponent implements OnInit, OnDestroy {
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

  //* Configuración del tutorial
  tutorialConfig: TutorialConfig = {
    steps: [
      {
        title: 'Nuevo techo presupuestal',
        element: '#nuevo_techo',
        intro: 'Haz clic aquí para crear un nuevo techo presupuestal.',
        position: 'bottom',
      },
      {
        title: 'Exportar techos presupuestales',
        element: '#excel',
        intro:
          'Aquí podrás exportar en formato Excel los techos presupuestales',
        position: 'left',
      },
      {
        title: 'Tabla de techos presupuestales',
        element: 'ag-grid-angular',
        intro:
          'Esta tabla muestra todos los techos presupuestales con información detallada.',
        position: 'top',
      },
      {
        title: 'Filtros de búsqueda',
        element: '.ag-icon-filter',
        intro:
          'Utiliza estos filtros para buscar techos presupuestales específicos.',
        position: 'bottom',
      },
      {
        title: 'Editar producto',
        element: '#editar',
        intro:
          'Aquí podrás editar la información del techo presupuestal seleccionado.',
        position: 'left',
      },
    ],
    onComplete: () => {
      console.log('Tutorial completado en productos');
    },
    onExit: () => {
      console.log('Tutorial cerrado en productos');
    },
  };

  // Datos para la tabla
  public ceilingsData: BudgetCeilingViewModel[] = [];
  public filteredData: BudgetCeilingViewModel[] = [];
  public searchTerm = '';
  public loading = true;

  // Grid API y configuración
  private gridApi!: GridApi<BudgetCeilingViewModel>;

  // Configuración de AG Grid con colores consistentes
  myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });

  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 25, 50];

  // Definición de columnas
  columnDefs: ColDef[] = [
    {
      field: 'idFinanciero',
      headerName: 'ID Info',
      maxWidth: 100,
      cellRenderer: (params: any) => {
        return params.value || 'N/A';
      },
    },
    { field: 'id', headerName: 'ID Techo', hide: true }, // ID funcional oculto
    { field: 'areaName', headerName: 'Área', flex: 5, minWidth: 480 },
    { field: 'capituloName', headerName: 'Capítulo', flex: 5, minWidth: 480 },
    {
      field: 'financiamientoName',
      headerName: 'Financiamiento',
      flex: 2,
      minWidth: 200,
      tooltipField: 'financiamientoName',
      cellRenderer: (params: any) => {
        const value = params.value;
        if (!value) return '';
        return value.length > 20 ? value.substring(0, 20) + '...' : value;
      },
    },
    {
      field: 'formattedPresupuesto',
      headerName: 'Presupuesto',
      type: 'numericColumn',
      flex: 2,
      minWidth: 180,
      cellClass: 'text-end font-weight-bold',
      sort: 'desc',
    },
    { field: 'createdBy', headerName: 'Creado por', flex: 2.5, minWidth: 260 },
    {
      field: 'createdAt',
      headerName: 'Fecha Creación',
      flex: 1.5,
      minWidth: 160,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString('es-MX');
      },
    },
    {
      field: 'updatedAt',
      headerName: 'Actualizado',
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return (
          new Date(params.value).toLocaleDateString('es-MX') +
          ' ' +
          new Date(params.value).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })
        );
      },
    },
    ...(this.hasPermission('Financieros:view_actions')
      ? [
          {
            headerName: 'Acciones',
            field: 'actions',
            filter: false,
            sortable: false,
            cellRenderer: SharedActionsGridComponent,
            cellRendererParams: {
              onEdit: this.openEditDialog.bind(this),
              actions: ['edit'],
            },
            maxWidth: 120,
            cellClass: 'action-cell',
          },
        ]
      : []),
  ];

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
    animateRows: true,
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private modalService: CoreModalService,
    private budgetService: BudgetService,
    private alertService: CoreAlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (window.innerWidth <= 900) {
      if (this.columnDefs) {
        this.columnDefs = this.columnDefs.map((col, idx) => {
          // Solo las primeras 3 columnas tendrán ancho igual y fijo
          if (idx === 0 || idx === 2 || idx === 3) {
            return {
              ...col,
              minWidth: 130,
              maxWidth: 130,
              width: 130,
              flex: undefined,
            };
          }
          // Las demás mantienen su ancho mínimo para scroll horizontal
          return {
            ...col,
            minWidth: col.minWidth || 120,
            flex: col.flex || 1,
          };
        });
      }
    }
    this.loadData();

    // Suscribirse al estado de carga
    const loadingSub = this.budgetService.loading$.subscribe((isLoading) => {
      this.loading = isLoading;
    });
    this.subscriptions.push(loadingSub);
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadData(): void {
    this.budgetService.initialize();

    // Suscribirse a los cambios en los datos de techos presupuestales
    const ceilingsSub = this.budgetService.ceilings$.subscribe((ceilings) => {
      const viewModels = this.budgetService.mapCeilingsToViewModel(ceilings);
      this.ceilingsData = viewModels;
      this.applyFilters();
      this.cdr.detectChanges();
    });

    this.subscriptions.push(ceilingsSub);
  }
  onGridReady(params: GridReadyEvent<BudgetCeilingViewModel>): void {
    this.gridApi = params.api;
  }
  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();

    if (!term) {
      this.filteredData = [...this.ceilingsData];
    } else {
      this.filteredData = this.ceilingsData.filter(
        (item) =>
          item.areaName.toLowerCase().includes(term) ||
          item.capituloName?.toLowerCase().includes(term) ||
          item.financiamientoName?.toLowerCase().includes(term) ||
          item.id.toString().includes(term)
      );
    }

    // Si la grid está lista, actualiza los datos
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', this.filteredData);
    }
  }
  openAddDialog(): void {
    this.modalService.open(FormComponent, 'Agregar Techo Presupuestal', {
      // Pasar datos directamente en el objeto data
      ceilingData: null, // No hay datos para edición
      onSave: (newCeiling: BudgetCeiling) => {
        this.modalService.close();
        this.loadData(); // Recargar datos después de guardar
      },
      onCancel: () => {
        this.modalService.close();
      },
    });
  }
  openEditDialog(item: BudgetCeilingViewModel): void {
    const techo = this.budgetService['ceilingsSubject'].value.find(
      (c) =>
        c.ct_area_id === item.areaId &&
        c.ct_capitulo_id === item.capituloId &&
        c.ct_financiamiento_id === item.financiamientoId
    );

    const id_techo = techo?.id_techo;

    if (!id_techo) {
      this.alertService.error(
        'No se pudo encontrar el registro original para editar.'
      );
      return;
    }

    this.budgetService.getCeilingById(id_techo).subscribe({
      next: (ceiling) => {
        this.modalService.open(FormComponent, 'Editar Techo Presupuestal', {
          ceilingData: ceiling,
          onSave: (updatedCeiling: BudgetCeiling) => {
            this.modalService.close();
            this.loadData();
          },
          onCancel: () => {
            this.modalService.close();
          },
        });
      },
      error: () => {
        this.alertService.error(
          'No se pudo obtener la información del techo presupuestal'
        );
      },
    });
  }
  exportToExcel(): void {
    // Mostrar un mensaje de carga
    this.alertService.warning('Generando archivo Excel, por favor espere...');

    // Llamar al servicio para exportar a Excel
    const subscription = this.budgetService.exportToExcel().subscribe({
      next: () => {
        this.alertService.success('Excel generado correctamente');
      },
      error: (error) => {
        console.error('Error al exportar a Excel:', error);
        this.alertService.error('Error al generar el archivo Excel');
      },
    });

    this.subscriptions.push(subscription);
  }
}
