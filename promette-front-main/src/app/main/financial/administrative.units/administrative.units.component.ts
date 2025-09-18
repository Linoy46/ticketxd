import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  themeQuartz,
  GridOptions,
} from 'ag-grid-community';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import { CommonModule } from '@angular/common';
import { AdministrativeService } from './services/administrative.service';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { FormComponent } from './form/form.component';
import {
  Analyst,
  AdministrativeUnit,
} from './interfaces/administrative.interface';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';
import { localeText } from '../../../core/helpers/localText';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DiscardProductsComponent } from './discard-products/discard-products.component';
import { SelectPartidaComponent } from './select-partida/select-partida.component';
import { TutorialComponent } from '../../../shared/tutorial/tutorial.component';
import { TutorialConfig } from '../../../core/services/tutorial.service';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-administrative-units',
  templateUrl: './administrative.units.component.html',
  styleUrls: ['./administrative.units.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridAngular,
    SharedCustomModalComponent,
    AutoCompleteModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    RadioButtonModule,
    TooltipModule,
    TutorialComponent,
  ],
})
export class AdministrativeUnitsComponent implements OnInit, OnDestroy {
  //* Configuración del tutorial
  tutorialConfig: TutorialConfig = {
    steps: [
      {
        title: 'Asiganr analista',
        element: '#nuevo_analista',
        intro: 'Aquí puedes asignar un/a Analista a una Unidad Administrativa.',
        position: 'bottom',
      },
      {
        title: 'Tabla de Unidades Administrativas',
        element: 'ag-grid-angular',
        intro:
          'Esta tabla muestra todos los techos presupuestales disponibles con información detallada.',
        position: 'top',
      },
      {
        title: 'Filtros de búsqueda',
        element: '.ag-icon-filter',
        intro:
          'Utiliza estos filtros en cada columna para buscar Unidades Administrativas por ID, Nombre de Unidad Administrativa, Por encargado de la Unidad Administrativa, Analista o Estado.',
        position: 'bottom',
      },
      {
        title: 'Estado del registro',
        element: '#estado',
        intro:
          'Indica el estado de cada una de las Unidades Administrativas (<small class="text-success">Activo</small> o <small class="text-danger">Inactivo</small>).',
        position: 'left',
      },
      {
        title: 'Asignar Partida',
        element: '#partida',
        intro:
          'Aquí podrás asignar partidas a la Unidad Administrativa seleccionada.',
        position: 'right',
      },
      {
        title: 'Descartar productos',
        element: '#producto',
        intro:
          'Descartar los productos a la Unidad Administrativa seleccionada.',
        position: 'right',
      },
      {
        title: 'Descargar excel',
        element: '#excel',
        intro:
          'Exporta en excel el desglose de conceptos por partida de la Unidad Administrativa seleccionada.',
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

  // Variables para datos
  analysts: Analyst[] = [];
  administrativeUnits: AdministrativeUnit[] = [];
  displayData: any = [];
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
  // Aquí se obtiene el usuario con un getter
  get permissions() {
    return this.permissionsSelector(); // Se actualiza automáticamente
  }
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  constructor(
    private modalService: CoreModalService,
    private adminService: AdministrativeService,
    private alertService: CoreAlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (window.innerWidth <= 900) {
      // Todas las columnas del mismo tamaño y scroll horizontal en móviles/tablets
      this.columnDefs = this.columnDefs.map((col) => ({
        ...col,
        minWidth: 120,
        flex: 1,
      }));
    }
    this.loadAdministrativeUnits();
    this.loadAnalysts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Método para cargar las unidades administrativas
  loadAdministrativeUnits(): void {
    this.adminService
      .getAdministrativeUnits()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.administrativeUnits) {
            this.administrativeUnits = response.administrativeUnits;
            this.processDataForGrid();
            this.cdr.detectChanges();
          } else {
            this.administrativeUnits = [];
            this.displayData = [];
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Error al cargar las unidades administrativas:', error);
          this.alertService.error(
            'Error al cargar las unidades administrativas'
          );
        },
      });
  }

  // Método para cargar los analistas
  loadAnalysts(): void {
    this.adminService
      .getAnalysts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.analysts = response.analysts || [];
          // Una vez cargados los analistas, actualizar la vista
          this.processDataForGrid();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar los analistas:', error);
        },
      });
  }

  processDataForGrid(): void {
    if (!this.administrativeUnits || this.administrativeUnits.length === 0) {
      this.displayData = [];
      return;
    }

    const sortedUnits = [...this.administrativeUnits].sort(
      (a, b) => a.id_financiero - b.id_financiero
    );

    this.displayData = sortedUnits
      .map((unit) => {
        // Buscar analista asignado a esta unidad administrativa
        const analista = this.findAnalistaForUnit(unit.id_area_fin);

        // Verificar si el usuario tiene el puesto 258
        const isAnalyst = (
          this.user.rl_usuario_puestos as { ct_puesto_id: number }[]
        ).some((puesto) => puesto.ct_puesto_id === 258);

        // Filtrar filas según las condiciones
        if (isAnalyst && analista?.ct_usuario_id === this.user.id_usuario) {
          return {
            id: unit.id_financiero,
            unidadAdministrativa: unit.nombre || 'Sin nombre',
            encargado: 'Sin asignar',
            analista: analista?.ct_usuario?.nombre_usuario || 'Sin asignar',
            estado: analista?.estado === 1 ? 'Activo' : 'Inactivo',
            originalData: unit,
          };
        }

        if (!isAnalyst && analista?.ct_usuario_id !== this.user.id_usuario) {
          return {
            id: unit.id_financiero,
            unidadAdministrativa: unit.nombre || 'Sin nombre',
            encargado: 'Sin asignar',
            analista: analista?.ct_usuario?.nombre_usuario || 'Sin asignar',
            estado: analista?.estado === 1 ? 'Activo' : 'Inactivo',
            originalData: unit,
          };
        }

        // Retornar null para omitir filas que no cumplen
        return null;
      })
      .filter((row) => row !== null); // Filtrar valores nulos
  }

  // Método para encontrar analista para una unidad administrativa
  findAnalistaForUnit(idAreaFin: number): Analyst | null {
    if (!this.analysts || this.analysts.length === 0) return null;

    // Buscar analista por el id de la unidad administrativa en el campo rl_area_financiero_id
    return (
      this.analysts.find(
        (analyst) =>
          analyst.rl_area_financiero_rl_area_financiero?.id_area_fin ===
          idAreaFin
      ) || null
    );
  }

  //AG-Grid
  myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });

  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 25, 50];

  columnDefs: ColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      flex: 1,
      minWidth: 120,
      filter: true,
      sortable: true,
    },
    {
      headerName: 'Unidad Administrativa',
      field: 'unidadAdministrativa',
      minWidth: 400, // aumentado para mejor visibilidad
      flex: 1,
      filter: true,
      sortable: true,
    },
    {
      field: 'encargado',
      headerName: 'Encargado de la U.A.',
      flex: 1,
      minWidth: 180,
      filter: true,
      sortable: true,
    },
    {
      field: 'analista',
      headerName: 'Analista',
      flex: 1,
      minWidth: 180,
      filter: true,
      sortable: true,
    },
    {
      field: 'estado',
      headerName: 'Estado',
      valueGetter: (params) => {
        const estado = params.data.estado;
        return estado === 'Activo' ? 'Activo' : 'Inactivo';
      },
      cellRenderer: (params: { value: any }) => {
        const estado = params.value;
        if (estado === 'Activo') {
          return `<span id="estado" class="badge bg-success estado-cell">${estado}</span>`;
        } else {
          return `<span id="estado" class="badge bg-danger estado-cell">${estado}</span>`;
        }
      },
      minWidth: 110,
      maxWidth: 130,
      filter: true,
      sortable: true,
    },
    ...(this.hasPermission('Financieros:head')
      ? [
          {
            field: 'actions',
            headerName: 'Acciones',
            cellStyle: { textAlign: 'center' },
            cellRenderer: SharedActionsGridComponent,
            cellRendererParams: {
              onEdit: this.editUnit.bind(this),
              onDelete: this.deleteUnit.bind(this),
            },
            flex: 1,
            minWidth: 120,
            maxWidth: 180,
            filter: false,
          },
        ]
      : []),
    ...(this.hasPermission('Financieros:view_partida')
      ? [
          {
            headerName: 'Partida',
            cellStyle: { textAlign: 'center' },
            cellRenderer: SharedActionsGridComponent,
            cellRendererParams: {
              onPartida: this.partida.bind(this),
            },
            minWidth: 140, // antes flex: 1, maxWidth: 120
            maxWidth: 180,
            filter: false,
          },
        ]
      : []),
    ...(this.hasPermission('Financieros:view_producto')
      ? [
          {
            headerName: 'Producto',
            cellStyle: { textAlign: 'center' },
            cellRenderer: SharedActionsGridComponent,
            cellRendererParams: {
              onProducto: this.producto.bind(this),
            },
            minWidth: 140, // antes flex: 1, maxWidth: 120
            maxWidth: 180,
            filter: false,
          },
        ]
      : []),
  ];

  public gridOptions: GridOptions = {
    defaultColDef: {
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
    },
    localeText: localeText,
    pagination: true,
    paginationPageSize: this.paginationPageSize,
    paginationPageSizeSelector: this.paginationPageSizeSelector,
  };

  // Añadir unidad administrativa
  addUnit(): void {
    // Implementar lógica para añadir unidad
    this.alertService.info('Funcionalidad en desarrollo');
  }

  // Editar unidad administrativa
  editUnit(unit: any): void {
    // Implementar lógica para editar unidad
    this.alertService.info('Funcionalidad en desarrollo');
  }

  // Eliminar unidad administrativa
  deleteUnit(unit: any): void {
    // Implementar lógica para eliminar unidad
    this.alertService.info('Funcionalidad en desarrollo');
  }

  // Editar o asignar analista para una unidad administrativa específica
  editAnalystForUnit(unit: AdministrativeUnit): void {
    const analista = this.findAnalistaForUnit(unit.id_area_fin);

    if (analista) {
      // Si ya tiene analista, editar
      this.modalService.open(
        FormComponent,
        'Editar analista de unidad administrativa',
        {
          data: {
            mode: 'edit',
            analystId: analista.id_puesto_unidad,
            administrativeUnitId: unit.id_area_fin,
            loadData: this.refreshData.bind(this),
          },
        }
      );
    } else {
      // Si no tiene analista, asignar
      this.modalService.open(
        FormComponent,
        'Asignar analista a unidad administrativa',
        {
          data: {
            mode: 'assign',
            administrativeUnitId: unit.id_area_fin,
            administrativeUnitName: unit.nombre,
            loadData: this.refreshData.bind(this),
          },
        }
      );
    }
  }

  // Añadir analista (general, sin unidad específica)
  addAnalyst(): void {
    this.modalService.open(FormComponent, 'Asignar analista', {
      data: {
        mode: 'assign',
        loadData: this.refreshData.bind(this),
      },
    });
  }

  // Editar analista
  editAnalyst(analyst: Analyst): void {
    this.modalService.open(FormComponent, 'Editar analista', {
      data: {
        mode: 'edit',
        analystId: analyst.id_puesto_unidad,
        areaId: analyst.ct_area_id,
        administrativeUnitId:
          analyst.rl_area_financiero_rl_area_financiero?.id_area_fin,
        loadData: this.refreshData.bind(this),
      },
    });
  }

  refreshData(): void {
    this.loadAdministrativeUnits();
    this.loadAnalysts();
  }

  partida(event: any): void {
    console.log('PARTIDA: ', event);
    this.modalService.open(
      SelectPartidaComponent,
      'Asignar Partida a Unidad Administrativa',
      {
        dataRow: {
          id_financiero: event.id,
          id_area_fin: event.originalData.id_area_fin,
          nombre_area: event.originalData.nombre,
        },
      }
    );
  }

  producto(event: any): void {
    this.modalService.open(DiscardProductsComponent, 'Descartar Producto', {
      dataRow: {
        id_financiero: event.id,
        id_area_fin: event.originalData.id_area_fin,
        nombre_area: event.originalData.nombre,
      },
    });
  }

  excel(event: any): void {
    // console.log(event.unidadAdministrativa)
    console.log(
      'Descargando Excel de id_area_fin: ',
      event.originalData.id_area_fin
    );
    //descargar excel
    this.adminService
      .descargarExcel({ id_area_fin: event.originalData.id_area_fin })
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'DesglosePartida.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
