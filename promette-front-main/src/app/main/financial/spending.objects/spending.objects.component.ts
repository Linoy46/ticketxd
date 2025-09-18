import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community'; // Importar GridApi, GridReadyEvent, themeQuartz
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { FormComponent } from './form/form.component';
import { localeText } from '../../../core/helpers/localText';
import {
  Capitulo,
  Concepto,
  Especifica,
} from './interfaces/spending.interface';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component'; // Importar SharedActionsGridComponent
import { SpendingObjectsService } from './services/spending.objects.service';
import { finalize, Subscription } from 'rxjs';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';
import { TutorialComponent } from '../../../shared/tutorial/tutorial.component';
import { TutorialConfig } from '../../../core/services/tutorial.service';

// Register ag-Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-spending-objects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbNavModule,
    AgGridAngular,
    SharedCustomModalComponent,
    SharedActionsGridComponent,
    TutorialComponent, // Añadir SharedActionsGridComponent
  ],
  templateUrl: './spending.objects.component.html',
  styleUrls: ['./spending.objects.component.scss'],
})
export class SpendingObjectsComponent implements OnInit, OnDestroy {
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
        title: 'Nuevo Capítulo',
        element: '#nuevo_capitulo',
        intro: 'Haz clic aquí para crear un nuevo capítulo.',
        position: 'bottom',
      },
      {
        title: 'Nueva Partida',
        element: '#nueva_partida',
        intro: 'Haz clic aquí para crear una nueva partida.',
        position: 'bottom',
      },
      {
        title: 'Tabla de objetos de gasto',
        element: 'ag-grid-angular',
        intro:
          'Esta tabla muestra todos los objetos de gasto con información detallada.',
        position: 'top',
      },
      {
        title: 'Filtros de búsqueda',
        element: '.ag-icon-filter',
        intro:
          'Utiliza estos filtros para buscar objetos de gasto específicos.',
        position: 'bottom',
      },
      {
        title: 'Editar objeto de gasto',
        element: '#editar',
        intro:
          'Aquí podrás editar la información del objeto de gasto seleccionado.',
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

  activeTab: string = 'todos'; // Default tab
  capitulos: Capitulo[] = [];
  conceptos: Concepto[] = [];
  expenseObjects: Especifica[] = [];

  filteredExpenseObjects: Especifica[] = [];
  searchTerm = '';
  isLoading = false;

  private subscriptions: Subscription = new Subscription();

  // ag-Grid
  private gridApi!: GridApi<Especifica>;

  // Usar la misma definición de tema que en users.component.ts
  myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });

  paginationPageSize = 10;
  paginationPageSizeSelector: number[] | boolean = [10, 25, 50];

  // Configuración de la grid - Simplificar para que coincida con users
  gridOptions = {
    defaultColDef: {
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
    },
    localeText: localeText,
    columnChooser: true,
  };

  // Definición de columnas para ag-Grid - Simplificar
  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', maxWidth: 120, minWidth: 100 },
    { field: 'capitulo', headerName: 'Capítulo', flex: 1.5, minWidth: 220 },
    { field: 'concepto', headerName: 'Concepto', flex: 10, minWidth: 1200 },
    { field: 'clave', headerName: 'Clave', maxWidth: 140, minWidth: 120 },
    { field: 'especifica', headerName: 'Específica', flex: 4, minWidth: 600 },
    ...(this.hasPermission('Financieros:view_actions')
      ? [
          {
            headerName: 'Acciones',
            filter: false,
            sortable: false,
            cellRenderer: SharedActionsGridComponent,
            cellRendererParams: {
              onEdit: this.openEditDialog.bind(this),
            },
            cellStyle: { textAlign: 'center' },
            minWidth: 120,
            width: 120,
            maxWidth: 120,
          },
        ]
      : []),
  ];

  constructor(
    private modalService: CoreModalService,
    private spendingService: SpendingObjectsService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (window.innerWidth <= 900) {
      if (this.columnDefs) {
        this.columnDefs = this.columnDefs.map((col, idx) => {
          // Solo las primeras 3 columnas tendrán ancho igual y fijo
          if (idx === 0 || idx === 1 || idx === 2) {
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
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData(): void {
    this.isLoading = true;
    this.filteredExpenseObjects = [];

    const chaptersSubscription = this.spendingService
      .getAllChapters()
      .subscribe({
        next: (chapters) => {
          this.capitulos = chapters.map((chapter) => ({
            id: chapter.id_capitulo,
            nombre_capitulo: chapter.nombre_capitulo,
            clave_capitulo: chapter.clave_capitulo,
            estado: chapter.estado,
            nombre: chapter.nombre_capitulo,
          }));
          this.cdr.detectChanges();
          // Después de cargar capítulos, cargamos los items
          this.loadItems();
        },
        error: (error) => {
          console.error('Error loading chapters:', error);
          this.isLoading = false;
        },
      });

    this.subscriptions.add(chaptersSubscription);
  }

  // Método separado para cargar items
  loadItems(): void {
    const itemsSubscription = this.spendingService
      .getFormattedData()
      .subscribe({
        next: (data) => {
          this.ngZone.run(() => {
            console.log('Datos recibidos:', data);
            this.expenseObjects = data;
            this.isLoading = false;
            this.cdr.detectChanges();
            // Imprimir los datos para debugging
            if (data.length > 0) {
              console.log('Primer registro:', data[0]);
            } else {
              console.log('No hay datos disponibles');
            }
            this.updateFilteredData();
          });
        },
        error: (error) => {
          console.error('Error loading expense objects:', error);
          this.isLoading = false;
        },
      });

    this.subscriptions.add(itemsSubscription);
  }

  // Actualizar los datos filtrados
  updateFilteredData(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredExpenseObjects = this.expenseObjects.filter(
      (obj) =>
        obj.capitulo.toLowerCase().includes(term) ||
        obj.concepto.toLowerCase().includes(term) ||
        obj.clave.toLowerCase().includes(term) ||
        obj.especifica.toLowerCase().includes(term)
    );

    console.log('Datos filtrados:', this.filteredExpenseObjects);

    // Actualizar la vista manualmente
    if (this.gridApi) {
      console.log('Actualizando grid con datos filtrados');
      this.gridApi.setGridOption('rowData', this.filteredExpenseObjects);

      // Refrescar la visualización de la tabla
      setTimeout(() => {
        this.gridApi.refreshCells({ force: true });
        this.gridApi.sizeColumnsToFit();
      }, 100);
    }
  }

  onGridReady(params: GridReadyEvent<Especifica>): void {
    console.log('Grid ready event triggered');
    this.gridApi = params.api;

    // Aplicar los datos inmediatamente
    params.api.setGridOption('rowData', this.filteredExpenseObjects);

    // Ajustar tamaño de columnas
    setTimeout(() => {
      this.gridApi.sizeColumnsToFit();
    }, 100);
  }

  openAddCapituloDialog(): void {
    const newCapitulo: Capitulo = {
      clave_capitulo: 0,
      nombre_capitulo: '',
      nombre: '',
    };
    this.modalService.open(FormComponent, 'Agregar Capítulo', {
      item: newCapitulo,
      type: 'chapter',
      onSave: (addedChapter: Capitulo) => {
        console.log('Capítulo a crear:', addedChapter);
        this.spendingService.createChapter(addedChapter).subscribe({
          next: () => {
            this.loadData();
            this.modalService.close();
          },
          error: (error) => console.error('Error creating chapter:', error),
        });
      },
    });
  }
  openAddConceptoDialog(): void {
    const newConcepto: Concepto = {
      clave_partida: '',
      nombre_partida: '',
      ct_capitulo_id: 0,
    };
    console.log('Capítulos disponibles:', this.capitulos);
    this.modalService.open(FormComponent, 'Agregar Partida', {
      item: newConcepto,
      type: 'item',
      chapters: this.capitulos,
      onSave: (addedConcepto: Concepto) => {
        console.log('Partida a crear:', addedConcepto);
        this.spendingService.createItem(addedConcepto).subscribe({
          next: () => {
            this.loadData();
            this.modalService.close();
          },
          error: (error) => console.error('Error creating item:', error),
        });
      },
    });
  }

  handleEditEvent(event: any): void {
    const expenseId = event.detail;
    const expense = this.expenseObjects.find((e) => e.id === expenseId);
    if (expense) this.openEditDialog(expense);
  }
  openEditDialog(expense: Especifica): void {
    console.log('Abriendo edición para:', expense);
    this.spendingService.getItemById(expense.id).subscribe({
      next: (item) => {
        console.log('Item recuperado:', item);
        this.modalService.open(FormComponent, 'Editar Partida', {
          item: item,
          type: 'item',
          chapters: this.capitulos,
          onSave: (updatedItem: Concepto) => {
            console.log('Partida a actualizar:', updatedItem);
            this.spendingService
              .updateItem(updatedItem.id_partida!, updatedItem)
              .subscribe({
                next: () => {
                  this.loadData();
                  this.modalService.close();
                },
                error: (error) => console.error('Error updating item:', error),
              });
          },
        });
      },
      error: (error) => console.error('Error fetching item for edit:', error),
    });
  }
}
