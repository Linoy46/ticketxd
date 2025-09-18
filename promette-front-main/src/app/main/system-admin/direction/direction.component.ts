import { Component, AfterViewInit } from '@angular/core';
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
import { Direction } from './interfaces/interfaces';
import { DirectionsService } from './services/directions.service';
import { FormComponent }  from './form/form.component'
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';
import { localeText } from '../../../core/helpers/localText'

@Component({
  selector: 'app-direction',
  imports:  [AgGridAngular, SharedCustomModalComponent, CommonModule],
  templateUrl: './direction.component.html',
  styleUrl: './direction.component.scss'
})
export class DirectionComponent implements AfterViewInit {
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );
 // Aquí se obtiene el usuario con un getter
  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }

  public rowData: Direction[] = [];

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
      field: 'nombre_direccion',
      headerName: 'Nombre de la Dirección',
      flex: 1,
    },
    {
      // Comented until know dependencies catalog
      //field: 'ct_dependendencia.nombre_dependencia',
      field: 'ct_dependencia_id',
      headerName: 'Dependencia',
      filter: false,
      maxWidth: 350,
      flex:1,
      valueFormatter: (params) => {
        switch (params.value) {
          case 1:
            return 'SEPE';
          case 2:
            return 'USET';
          case 3:
            return 'Dirección General SEPE/USET';
          default:
            return 'Otra...'; // Opcional: para valores no contemplados
        }
      },
    },

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
    private directionsService: DirectionsService, // Inyecta el servicio de datos para acceder a las APIs.
    private alertService: CoreAlertService
  ) {}


  ngAfterViewInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.directionsService.getData().subscribe({
      next: (data) => {
        this.rowData = [...data.directions];
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }

  // Métodos para las acciones de las filas
  view(row: any) {
    this.modalService.open(FormComponent, 'Ver registro', {
      data: { mode: 'view', id_direccion: row.id_direccion },
    });
  }

  edit(row: any) {
    this.modalService.open(FormComponent, 'Editar registro', {
      data: {
        mode: 'edit',
        id_direccion: row.id_direccion,
        loadData: this.loadData.bind(this),
      },
    });
  }

  delete(row: any) {
    this.alertService
      .confirm(
        `¿Seguro que deseas eliminar a ${row.nombre_direccion}?`,
        'Eliminar registro',
      )
      .then((result) => {
        if (result.isConfirmed) {
          // Si el usuario confirma, elimina el registro y recarga los datos.
          this.directionsService.delete(this.user.id_usuario,row.id_direccion).subscribe(() => {
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
}
