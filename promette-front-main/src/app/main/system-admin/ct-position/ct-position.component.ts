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
import { Position } from './interfaces/interfaces';
import { PositionsService } from './services/positions.service';
import { FormComponent } from './form/form.component';
import { SharedAddPermissionsComponent } from '../../../shared/shared-add-permissions/shared-add-permissions.component';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';
import { localeText } from '../../../core/helpers/localText'

@Component({
  selector: 'ct-position-component',
  imports: [AgGridAngular, SharedCustomModalComponent, CommonModule],
  templateUrl: './ct-position.component.html',
  styleUrl: './ct-position.component.css',
})
export class CtPositionComponent implements AfterViewInit {
  private userSelector = injectSelector<RootState, any>(
      (state) => state.auth.user
    );
   // Aquí se obtiene el usuario con un getter
  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }
  public rowData: Position[] = [];

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
      field: 'id_puesto',
      headerName: 'ID',
      flex: 1,
      maxWidth: 100,
    },
    {
      field: 'nombre_puesto',
      headerName: 'Nombre del Puesto',
      flex: 1,
    },
    {
      field: 'areaName',
      headerName: 'Área',
      flex: 1,
      valueGetter: (params) => params.data.areaName,
    },
    {
      field: 'permissions',
      filter: false,
      headerName: 'Permisos',
      cellStyle: {
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      },
      cellRenderer: SharedActionsGridComponent,

      cellRendererParams: {
        onAdd: this.addPermission.bind(this),
        //onView: this.viewPermission.bind(this),
      },
      flex: 1,
      maxWidth: 125,
      // Configura el ancho de la columna de acciones.
    },
    {
      field: 'actions',
      filter: false,
      headerName: 'Acciones',
      cellStyle: {
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      },
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
    private positionService: PositionsService, // Inyecta el servicio de datos para acceder a las APIs.
    private alertService: CoreAlertService
  ) {}

  ngAfterViewInit(): void {
    this.loadData();
  }


loadData(): void {
  // Llama a los servicios para cargar los datos de puestos y áreas
  this.positionService.getData().subscribe({
    next: (positionData) => {
      this.positionService.getDataAreas().subscribe({
        next: (areaData) => {
          // Construir el mapa de áreas
          const areaMap: { [key: number]: string } = {};
          areaData.forEach((area: any) => {
            areaMap[area.id_area] = area.nombre;
          });

          // Actualiza los datos de la tabla
          this.rowData = positionData.positions.map((position: any) => ({
            ...position,
            areaName: areaMap[position.ct_area_id] || 'Área aún no asignada',
          }));
        },
        error: (error) => {
          console.error('Error al cargar áreas:', error);
        },
      });
    },
    error: (error) => {
      console.error('Error al cargar los puestos:', error);
    },
  });
  }

  // Métodos para las acciones de las filas
  view(row: any) {
    this.modalService.open(FormComponent, 'Ver registro', {
      data: { mode: 'view', id_puesto: row.id_puesto },
    });
  }

  edit(row: any) {
    this.modalService.open(FormComponent, 'Editar registro', {
      data: {
        mode: 'edit',
        id_puesto: row.id_puesto,
        loadData: this.loadData.bind(this),
      },
    });
  }

  delete(row: any) {
    this.alertService
      .confirm(
        `¿Seguro que deseas eliminar a ${row.nombre_puesto}?`,
        'Eliminar registro',
      )
      .then((result) => {
        if (result.isConfirmed) {
          // Si el usuario confirma, elimina el registro y recarga los datos.
          this.positionService.delete(this.user.id_usuario,row.id_puesto).subscribe(() => {
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

  async addPermission(row: any) {
    try {
      // Obtenemos los permisos de módulos usando el servicio y esperamos su resultado
      const { modules } = await this.positionService
        .getModulesPermissions()
        .toPromise();

      // Si `getPermissionsUsers` es un observable, debes esperar su resultado con `await` o convertirlo en promesa
      const { permissions } = await this.positionService
        .getPermissionsPositions(row.id_puesto)
        .toPromise(); // Asegúrate de que `getPermissionsUsers` retorne un Observable

      // Abrimos el modal pasando los permisos y otros datos requeridos
      this.modalService.open(SharedAddPermissionsComponent, 'Agregar función', {
        data: {
          permissions, // Ahora `permissions` contiene el resultado de `getPermissionsUsers`
          mode: 'positions',
          modules, // `modules` es el resultado de la promesa
          loadData: this.loadData.bind(this),
          savePermissions: this.savePermissions.bind(this),
          removePermissions: this.removePermissions.bind(this), // Eliminar permisos deseleccionados
          id_puesto: row.id_puesto,
        },
      });
    } catch (error) {
      console.error('Error al obtener permisos de módulos:', error);
    }
  }

  savePermissions(data: any): void {
    this.positionService.registerPermissionsPosition(data).subscribe({
      next: () => {
        console.log('Permisos guardados correctamente.');
        this.loadData(); // Recarga los datos
      },
      error: (err) => console.error('Error al guardar permisos:', err),
    });
  }

  removePermissions(data: any): void {
    this.positionService
      .removePermissionsPosition(data)
      .subscribe({
        next: () => {
          this.loadData(); // Recarga los datos después de eliminar los permisos
        },
        error: (err) => {
          console.error('Error al eliminar los permisos:', err);
        },
      });
  }

  // viewPermission(row: any) {
  //   //this.modalService.open(FunctionComponent, 'Ver funciones', {
  //   //  data: { mode: 'view', id_modulo: row.id_modulo },
  //   //});
  // }
}
