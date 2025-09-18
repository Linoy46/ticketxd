import { Component, AfterViewInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import { CommonModule } from '@angular/common';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { AreasService } from './services/areas.service';
import { Area } from './interfaces/interfaces';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';
import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import { FormComponent } from './form/form.component';
import { ModuleAreaComponent } from './component/module-area/module-area.component';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';
import { localeText } from '../../../core/helpers/localText'

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'ct-area-component',
  imports: [AgGridAngular, SharedCustomModalComponent, CommonModule],
  templateUrl: './ct-area.component.html',
  styleUrls: ['./ct-area.component.css'],
})
export class CtAreaComponent implements AfterViewInit {
  public rowData: Area[] = [];

  private userSelector = injectSelector<RootState, any>(
      (state) => state.auth.user
    );
 // Aquí se obtiene el usuario con un getter
 get user() {
  return this.userSelector(); // Se actualiza automáticamente
}

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
      field: 'nombre_area',
      headerName: 'Nombre del Área',
      flex: 1,
    },
    {
      field: 'modules',
      filter: false,
      headerName: 'Módulos',
      flex: 1,
      maxWidth: 125,
      cellStyle: {textAlign: 'center'},
      cellRenderer: SharedActionsGridComponent,

      cellRendererParams: {
        onAdd: this.viewModule.bind(this),
      },
    }
    ,
    {
      field: 'actions',
      filter: false,
      headerName: 'Acciones',
      cellStyle: {textAlign: 'center'},
      cellRenderer: SharedActionsGridComponent,

      cellRendererParams: {
        onView: this.view.bind(this),
        onEdit: this.edit.bind(this),
        onDelete: this.delete.bind(this),
      },
      flex: 1,
      maxWidth: 215,
      // Configura el ancho de la columna de acciones.
    },
  ];

  public gridOptions = {
    defaultColDef: {
      flex: 1,
      filter: true,
      sortable: true,
      resizable: true,
    },
    localeText: localeText,
    columnChooser: true,
    // Habilita el selector de columnas para que el usuario pueda elegir qué columnas ver.
  };

  constructor(
    private modalService: CoreModalService,
    private areasService: AreasService, // Inyecta el servicio de datos para acceder a las APIs.
    private alertService: CoreAlertService
  ) {}

  ngAfterViewInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.areasService.getData().subscribe({
      next: (data) => {
        this.rowData = [...data.areas];
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }

  // Métodos para las acciones de las filas
  view(row: any) {
    this.modalService.open(FormComponent, 'Ver registro', {
      data: { mode: 'view', id_area: row.id_area },
    });
  }

  edit(row: any) {
    this.modalService.open(FormComponent, 'Editar registro', {
      data: {
        mode: 'edit',
        id_area: row.id_area,
        loadData: this.loadData.bind(this),
      },
    });
  }

  delete(row: any) {
    this.alertService
      .confirm(
        `¿Seguro que deseas eliminar a ${row.nombre_area}?`,
        'Eliminar registro',
      )
      .then((result) => {
        if (result.isConfirmed) {
          // Si el usuario confirma, elimina el registro y recarga los datos.
          this.areasService.delete(this.user.id_usuario,row.id_area).subscribe(() => {
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

  viewModule(row: any){
    this.modalService.open(ModuleAreaComponent, 'Ver módulos', {
      data: { mode: 'add', id_area: row.id_area },
    });
  }
}
