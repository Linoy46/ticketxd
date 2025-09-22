import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

import {
  NgxDatatableModule,
  ColumnMode,
  SelectionType,
  DatatableComponent,
} from '@swimlane/ngx-datatable';

import { InventoriesService } from './services/inventories.service';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { CoreLoadingService } from '../../../core/services/core.loading.service'; // Import CoreLoadingService
import { Inventario } from './interfaces/inventories.interface';
import { FormComponent } from './form/form.component';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';

import { TutorialComponent } from '../../../shared/tutorial/tutorial.component';
import { TutorialConfig } from '../../../core/services/tutorial.service';

// Definición de interfaz para columnas de tabla
interface TableColumn {
  name: string;
  prop: string;
  flexGrow?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  cellTemplate?: TemplateRef<any>;
}

@Component({
  selector: 'app-inventories',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgxDatatableModule,
    FormsModule,
    SharedCustomModalComponent,
    TutorialComponent
],
  templateUrl: './inventories.component.html',
  styleUrl: './inventories.component.scss',
})
export class InventoriesComponent implements OnInit, OnDestroy {
  @ViewChild('inventoryTable') table!: DatatableComponent;
  @ViewChild('actionsTemplate') actionsTemplate!: TemplateRef<any>;
  @ViewChild('stockTemplate') stockTemplate!: TemplateRef<any>;
  @ViewChild('partidaTemplate') partidaTemplate!: TemplateRef<any>;

  //* Configuración del tutorial
  tutorialConfig: TutorialConfig = {
    steps: [
      {
        title: 'Barra de busqueda',
        element: '#buscador',
        intro:
          'Busca en el inventario por Folio, Descripción, Partida, Unidad o Factura.',
        position: 'right',
      },
      {
        title: 'Nueva entrada',
        element: '#nuevo',
        intro: 'Aquí podrás ingresar nuevas Entradas.',
        position: 'left',
      },
      {
        title: 'Tabla de inventarios',
        element: '#tabla-consumibles',
        intro:
          'Aquí encontrarás la información necesaria sobre los inventarios.',
        position: 'top',
      },
      {
        title: 'Editar entrada',
        element: '#editar',
        intro: 'Aquí podrás actualizar los datos del registro selecionado.',
        position: 'bottom',
      },
      {
        title: 'Registros por página',
        element: '#por-pagina',
        intro:
          'Aquí podrás cambiar la cantidad de las entradas visibles en la tabla.',
        position: 'left',
      },
    ],
    onComplete: () => {
      console.log('Tutorial completado en unidades');
    },
    onExit: () => {
      console.log('Tutorial cerrado en unidades');
    },
  };

  // Datos y estado
  inventoryData: Inventario[] = [];
  displayData: any[] = [];
  selected: any[] = [];

  // Variables para el funcionamiento de la tabla
  searchText: string = '';
  filteredData: any[] = [];
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  limit: number = 10;
  limits: number[] = [5, 10, 25, 50, 100];
  offset: number = 0;

  stockThreshold: number = 10;

  // Configuración de columnas para la tabla
  columns: TableColumn[] = [
    {
      name: 'Folio',
      prop: 'folio',
      sortable: true,
      flexGrow: 1,
      minWidth: 100,
    },
    {
      name: 'Descripción',
      prop: 'description',
      sortable: true,
      flexGrow: 2,
      minWidth: 180,
    },
    {
      name: 'Observaciones',
      prop: 'observaciones',
      sortable: true,
      flexGrow: 1.5,
      minWidth: 150,
    },
    {
      name: 'Cantidad',
      prop: 'quantity',
      sortable: true,
      flexGrow: 0.7,
      minWidth: 80,
    },
    {
      name: 'Disponible',
      prop: 'available',
      sortable: true,
      flexGrow: 0.8,
      minWidth: 100,
    },
    {
      name: 'Utilizada',
      prop: 'used',
      sortable: true,
      flexGrow: 0.7,
      minWidth: 80,
    },
    {
      name: 'Partida',
      prop: 'partida',
      sortable: true,
      flexGrow: 1.5,
      minWidth: 150,
    },
    {
      name: 'Unidad',
      prop: 'unit',
      sortable: true,
      flexGrow: 0.7,
      minWidth: 80,
    },
    {
      name: 'Factura',
      prop: 'invoice',
      sortable: true,
      flexGrow: 0.9,
      minWidth: 100,
    },
    {
      name: 'Fecha',
      prop: 'date',
      sortable: true,
      flexGrow: 0.9,
      minWidth: 100,
    },
    {
      name: 'Acciones',
      prop: 'actions',
      sortable: false,
      flexGrow: 0.7,
      minWidth: 80,
    },
  ];

  // Subject para gestionar la finalización de observables
  private destroy$ = new Subject<void>();

  // Para usar Math en la plantilla
  Math = Math;
  col: any;

  constructor(
    private inventoriesService: InventoriesService,
    private alertService: CoreAlertService,
    private modalService: CoreModalService,
    private router: Router,
    public loadingService: CoreLoadingService
  ) {}

  ngOnInit(): void {
    this.setResponsiveColumns();
    this.loadData();
  }

  setResponsiveColumns(): void {
    if (window.innerWidth < 1024) {
      this.columns = [
        { name: 'Folio', prop: 'folio', flexGrow: 1, minWidth: 120 },
        {
          name: 'Descripción',
          prop: 'description',
          flexGrow: 1,
          minWidth: 120,
        },
        { name: 'Cantidad', prop: 'quantity', flexGrow: 1, minWidth: 120 },
        {
          name: 'Observaciones',
          prop: 'observaciones',
          flexGrow: 1,
          minWidth: 120,
        },
        { name: 'Disponible', prop: 'available', flexGrow: 1, minWidth: 120 },
        { name: 'Utilizada', prop: 'used', flexGrow: 1, minWidth: 120 },
        { name: 'Partida', prop: 'partida', flexGrow: 1, minWidth: 120 },
        { name: 'Unidad', prop: 'unit', flexGrow: 1, minWidth: 120 },
        { name: 'Factura', prop: 'invoice', flexGrow: 1, minWidth: 120 },
        { name: 'Fecha', prop: 'date', flexGrow: 1, minWidth: 120 },
        { name: 'Acciones', prop: 'actions', flexGrow: 1, minWidth: 120 },
      ];
    } else {
      this.columns = [
        { name: 'Folio', prop: 'folio', flexGrow: 1, minWidth: 100 },
        {
          name: 'Descripción',
          prop: 'description',
          flexGrow: 2,
          minWidth: 180,
        },
        {
          name: 'Observaciones',
          prop: 'observaciones',
          flexGrow: 1.5,
          minWidth: 150,
        },
        { name: 'Cantidad', prop: 'quantity', flexGrow: 0.7, minWidth: 80 },
        { name: 'Disponible', prop: 'available', flexGrow: 0.8, minWidth: 100 },
        { name: 'Utilizada', prop: 'used', flexGrow: 0.7, minWidth: 80 },
        { name: 'Partida', prop: 'partida', flexGrow: 1.5, minWidth: 150 },
        { name: 'Unidad', prop: 'unit', flexGrow: 0.7, minWidth: 80 },
        { name: 'Factura', prop: 'invoice', flexGrow: 0.9, minWidth: 100 },
        { name: 'Fecha', prop: 'date', flexGrow: 0.9, minWidth: 100 },
        { name: 'Acciones', prop: 'actions', flexGrow: 0.7, minWidth: 80 },
      ];
    }
  }

  ngAfterViewInit() {
    // Ajustar la tabla después de que se carga la vista
    setTimeout(() => {
      if (this.table) {
        this.table.recalculate();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos de inventario
   */
  loadData(): void {
    this.loadingService.show();

    this.inventoriesService
      .getInventario()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.inventoryData = data;
          this.processInventoryData();
        },
        error: () => {
          this.loadingService.hide();
        },
      });
  }

  /**
   * Procesa los datos para visualización
   */
  processInventoryData(): void {
    this.inventoriesService
      .getInventarioDisplayData(this.inventoryData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (displayData) => {
          this.displayData = displayData;
          this.filteredData = [...displayData];
          this.loadingService.hide();
          this.validatePageOffset();

          // Recalcular después de que los datos estén cargados
          setTimeout(() => {
            if (this.table) {
              this.table.recalculate();
            }
          }, 100);
        },
        error: () => {
          this.loadingService.hide();
          this.displayData = [];
          this.filteredData = [];
        },
      });
  }

  /**
   * Valida que el offset de la página sea válido para la cantidad de datos
   */
  private validatePageOffset(): void {
    const totalPages = Math.ceil(this.filteredData.length / this.limit);

    // Si el offset actual es mayor que el número de páginas disponibles, ajustarlo
    if (totalPages > 0 && this.offset >= totalPages) {
      this.offset = totalPages - 1;

      // Si tenemos una referencia a la tabla, actualizar su offset también
      if (this.table) {
        this.table.offset = this.offset;
      }
    }
  }

  /**
   * Actualiza la lista filtrada cuando cambia el texto de búsqueda
   */
  onSearchChange(): void {
    if (!this.displayData) {
      this.filteredData = [];
      return;
    }

    if (!this.searchText) {
      this.filteredData = [...this.displayData];
    } else {
      const term = this.searchText.toLowerCase();
      this.filteredData = this.displayData.filter((row) => {
        return Object.keys(row).some((key) => {
          const value = row[key];
          return value != null && value.toString().toLowerCase().includes(term);
        });
      });
    }

    // Resetear paginación al filtrar
    this.offset = 0;
    if (this.table) {
      this.table.offset = 0;
    }

    this.validatePageOffset();

    setTimeout(() => {
      if (this.table) {
        this.table.recalculate();
      }
    }, 0);
  }

  /**
   * Maneja el cambio de página
   */
  onPageChange(event: any): void {
    console.log('Cambio de página:', event);
    this.offset = event.offset;
    const totalPages = Math.ceil(this.filteredData.length / this.limit);
    if (this.offset >= totalPages) {
      this.offset = totalPages - 1;
      if (this.offset < 0) this.offset = 0;
      if (this.table) {
        this.table.offset = this.offset;
      }
    }

    setTimeout(() => {
      if (this.table) {
        this.table.recalculate();
      }
    }, 0);
  }

  /**
   * Maneja el cambio en la cantidad de elementos por página
   */
  onLimitChange(): void {
    this.offset = 0;
    const totalPages = Math.ceil(this.filteredData.length / this.limit);
    console.log(`Nuevo límite: ${this.limit}, Total páginas: ${totalPages}`);

    if (this.table) {
      this.table.offset = 0;
      this.table.limit = this.limit;
      this.table.recalculate();
    }
  }

  /**
   * Abre el formulario para editar un elemento
   */
  editItem(row: any): void {
    const originalInventoryItem = this.inventoryData.find(
      (item) => item.id_inventario === row.id
    );

    if (!originalInventoryItem) {
      this.alertService.error(
        'Error',
        'No se pudo encontrar el elemento en el inventario'
      );
      return;
    }

    this.modalService.open(FormComponent, `Editar Entrada: ${row.folio}`, {
      inventoryItem: originalInventoryItem,
      isModal: true,
      close: () => this.modalService.close(),
      cancel: () => this.modalService.close(),
      saveSuccess: (updatedItem: Inventario) => {
        this.modalService.close();
        this.updateInventoryItem(updatedItem);
        this.alertService.success(
          'Éxito',
          'Inventario actualizado correctamente'
        );
      },
    });
  }

  /**
   * Actualiza un elemento en la lista local
   */
  updateInventoryItem(updatedItem: Inventario): void {
    const indexInInventoryData = this.inventoryData.findIndex(
      (item) => item.id_inventario === updatedItem.id_inventario
    );

    if (indexInInventoryData !== -1) {
      this.inventoryData[indexInInventoryData] = updatedItem;
      this.processInventoryData();
    }
  }

  /**
   * Navega a la página para crear una nueva entrada
   */
  onAddNew(): void {
    this.router.navigate(['/promette/inventory-entries']);
  }

  /**
   * Retorna un número seguro para las propiedades de la tabla
   */
  getSafeNumber(value?: number, defaultValue: number = 0): number {
    return value !== undefined && value !== null ? value : defaultValue;
  }

  /**
   * Manejador para el botón de editar en SharedActionsGrid
   */
  onEditItem(row: any): void {
    this.editItem(row);
  }

  /**
   * Verifica si un producto tiene stock bajo
   */
  hasLowStock(item: any): boolean {
    if (!item || item.available === undefined || item.available === null)
      return false;
    return item.available <= this.stockThreshold;
  }

  /**
   * Verifica si un producto tiene stock agotado
   */
  isOutOfStock(item: any): boolean {
    if (!item || item.available === undefined || item.available === null)
      return false;
    return item.available <= 0;
  }

  /**
   * Abre modal para reponer stock
   */
  replenishStock(row: any): void {
    if (!row || !row.id) {
      this.alertService.error('Error', 'No se pudo identificar el elemento');
      return;
    }

    const originalInventoryItem = this.inventoryData.find(
      (item) => item.id_inventario === row.id
    );

    if (!originalInventoryItem) {
      this.alertService.error(
        'Error',
        'No se pudo encontrar el elemento en el inventario'
      );
      return;
    }

    this.modalService.open(
      FormComponent,
      `Reponer Stock: ${row.folio || 'N/A'}`,
      {
        inventoryItem: originalInventoryItem,
        isModal: true,
        isStockReplenishment: true,
        close: () => this.modalService.close(),
        cancel: () => this.modalService.close(),
        saveSuccess: (updatedItem: Inventario) => {
          this.modalService.close();
          this.updateInventoryItem(updatedItem);
          this.alertService.success('Éxito', 'Stock actualizado correctamente');
        },
      }
    );
  }

  /**
   * Obtiene el estilo de la celda basado en el nivel de stock
   */
  getStockCellStyle(row: any): any {
    if (!row) return {};

    if (this.isOutOfStock(row)) {
      return { color: '#dc3545', 'font-weight': 'bold' }; // Rojo para stock agotado
    } else if (this.hasLowStock(row)) {
      return { color: '#ffc107', 'font-weight': 'bold' }; // Amarillo para stock bajo
    } else {
      return { color: '#198754' }; // Verde para stock normal
    }
  }
}
