import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import { CommonModule } from '@angular/common';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { AgGridAngular } from 'ag-grid-angular';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';
import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import { Module } from './interfaces/interfaces';
import { ModulesService } from './services/modules.service';
import { FormComponent } from './form/form.component';
import { FunctionComponent } from './components/function/function.component';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';
import { localeText } from '../../../core/helpers/localText';

// Registra los módulos necesarios de ag-Grid (Community)
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'module-component',
  imports: [AgGridAngular, SharedCustomModalComponent, CommonModule],
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.css'],
})
export class ModuleComponent implements OnInit, AfterViewInit, OnDestroy {
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );
  // Aquí se obtiene el usuario con un getter
  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }

  public rowData: Module[] = [];
  public rowData2: any;

  public myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });
  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 25, 50];

  public columnDefs: ColDef[] = [
    {
      field: 'nombre_modulo',
      headerName: 'Nombre del Módulo',
      flex: 1,
      minWidth: 30,
    },
    {
      field: 'functions',
      headerName: 'Funciones',
      filter: false,
      flex: 1,
      minWidth: 30,
      cellStyle: {
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: {
        onView: this.viewFunction.bind(this),
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      filter: false,
      flex: 1,
      minWidth: 30,
      cellStyle: {
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: {
        onView: this.view.bind(this),
        onEdit: this.edit.bind(this),
        onDelete: this.delete.bind(this),
      },
    },
  ];

  private originalColumnDefs: ColDef[] | null = null;
  private resizeHandler = this.setResponsiveColumns.bind(this);

  public gridOptions = {
    defaultColDef: {
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
    },
    localeText: localeText,
    columnChooser: true,
  };

  constructor(
    private modalService: CoreModalService,
    private modulesService: ModulesService, // Inyecta el servicio de datos para acceder a las APIs.
    private alertService: CoreAlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.loadData();
  }

  ngOnInit(): void {
    if (!this.originalColumnDefs) {
      this.originalColumnDefs = this.columnDefs.map((c) => ({ ...c }));
    }
    this.setResponsiveColumns();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
  }
  setResponsiveColumns(): void {
    try {
      const width = window.innerWidth;
      if (!this.originalColumnDefs) {
        this.originalColumnDefs = this.columnDefs.map((c) => ({ ...c }));
      }

      if (width <= 900) {
        // Mostrar exactamente 3 columnas visibles ajustando a un ancho más estrecho
        const target = Math.floor(width / 3) - 12; // ajuste más estrecho adicional
        const cap = target < 110 ? 110 : target; // mínimo legible
        const actionExtra = 0; // todas iguales aquí
        const newDefs = this.originalColumnDefs.map((col, idx) => {
          if (idx < 3) {
            return {
              ...col,
              flex: undefined,
              width: cap,
              minWidth: cap,
              maxWidth: cap,
            } as ColDef;
          }
          return {
            ...col,
            flex: 1,
            minWidth: cap + actionExtra,
          } as ColDef;
        });
        this.columnDefs = newDefs;
      } else {
        this.columnDefs = this.originalColumnDefs.map((c) => ({ ...c }));
      }
    } catch (err) {
      console.error('Error in setResponsiveColumns:', err);
    }
  }

  loadData(): void {
    this.modulesService.getData().subscribe({
      next: (data) => {
        this.rowData = [...data.modules];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }

  // Métodos para las acciones de las filas
  view(row: any) {
    this.modalService.open(FormComponent, 'Ver registro', {
      data: { mode: 'view', id_modulo: row.id_modulo },
    });
  }

  edit(row: any) {
    this.modalService.open(FormComponent, 'Editar registro', {
      data: {
        mode: 'edit',
        id_modulo: row.id_modulo,
        loadData: this.loadData.bind(this),
      },
    });
  }

  delete(row: any) {
    this.alertService
      .confirm(
        `¿Seguro que deseas eliminar a ${row.nombre_modulo}?`,
        'Eliminar registro'
      )
      .then((result) => {
        if (result.isConfirmed) {
          // Si el usuario confirma, elimina el registro y recarga los datos.
          this.modulesService
            .delete(this.user.id_usuario, row.id_modulo)
            .subscribe(() => {
              this.loadData();
            });
        }
      });
  }

  add() {
    this.modalService.open(FormComponent, 'Agregar registro', {
      data: { mode: 'add', loadData: this.loadData.bind(this) },
    });
  }

  viewFunction(row: any) {
    this.modalService.open(FunctionComponent, 'Ver registros', {
      data: { mode: 'view', id_modulo: row.id_modulo },
    });
  }
}
