// app.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Importa el decorador `Component` de Angular y `OnInit` para manejar la inicialización del componente.

import { AgGridAngular } from 'ag-grid-angular';
// Importa el componente `AgGridAngular` de ag-Grid para utilizar la tabla de datos.

import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
// Importa elementos esenciales de ag-Grid, incluyendo módulos y configuraciones de estilo.

import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';
// Importa el componente de acciones personalizadas para las celdas de la tabla (Ver, Editar, Eliminar).

import { CoreModalService } from '../../../core/services/core.modal.service';
// Importa el servicio para manejar modales en la aplicación.

import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
// Importa un componente de modal personalizado.

import { CommonModule } from '@angular/common';
// Importa el módulo común de Angular, necesario para funcionalidades básicas como directivas y pipes.

import { UsersService } from './services/users.service';
// Importa el servicio para obtener y manipular los datos (obtener, eliminar, etc.).

import { FormComponent } from './form/form.component';
// Importa el componente de formulario para manejar la edición, visualización y creación de registros.

import { CoreAlertService } from '../../../core/services/core.alert.service';
import { User } from './interfaces/interfaces';
import { UserPositionComponent } from './components/user-position/user-position.component';
import { SharedAddPermissionsComponent } from '../../../shared/shared-add-permissions/shared-add-permissions.component';
import { Observable } from 'rxjs';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';

import { localeText } from '../../../core/helpers/localText';

// Importa el servicio de alertas para mostrar mensajes y confirmaciones.

ModuleRegistry.registerModules([AllCommunityModule]);
// Registra todos los módulos necesarios de ag-Grid.

@Component({
  selector: 'users.component',
  // Define el selector del componente que será utilizado en el HTML para invocar este componente.

  templateUrl: './users.component.html',
  // Define la ruta al archivo HTML de la plantilla del componente.

  imports: [AgGridAngular, SharedCustomModalComponent, CommonModule],
  // Importa los módulos necesarios para este componente (ag-Grid, modales, etc.).
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  constructor(
    private modalService: CoreModalService,
    private usersService: UsersService, // Inyecta el servicio de datos para acceder a las APIs.
    private alertService: CoreAlertService,
    private cdr: ChangeDetectorRef
  ) {}
  private userSelector = injectSelector<RootState, any>(
    (state) => state.auth.user
  );
  // Aquí se obtiene el usuario con un getter
  get user() {
    return this.userSelector(); // Se actualiza automáticamente
  }
  rowData: User[] = [];
  // Almacena los datos que se mostrarán en la tabla ag-Grid.

  ngOnInit(): void {
    this.setResponsiveColumns();
    this.loadData();
    window.addEventListener('resize', () => this.setResponsiveColumns());
    // Llama al método `loadData()` para cargar los datos de la API cuando el componente se inicializa.
  }

  setResponsiveColumns(): void {
    const w = window.innerWidth;
    if (w <= 768) {
      // Móvil: mostrar exactamente 3 columnas completas SIN recorte
      // Ajuste: calcular base para que quepan 3 justo y no aparezca una cuarta cortada
      // Restamos un pequeño margen (4px) para evitar scroll parcial visual
      let mobileBase = Math.floor(w / 3) - 9; // micro ajuste final
      if (mobileBase < 100) mobileBase = 100; // límite mínimo de legibilidad
      this.columnDefs = [
        { field: 'id_usuario', headerName: '#', minWidth: mobileBase },
        { field: 'nombre_usuario', headerName: 'Nombre', minWidth: mobileBase },
        { field: 'curp', headerName: 'CURP', minWidth: mobileBase },
        { field: 'telefono', headerName: 'Teléfono', minWidth: mobileBase },
        {
          field: 'positions',
          headerName: 'Puestos',
          minWidth: mobileBase + 4, // mantenemos
          cellStyle: {
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
          cellRenderer: SharedActionsGridComponent,
          cellRendererParams: { onView: this.viewPosition.bind(this) },
        },
        {
          field: 'permissions',
          headerName: 'Permisos',
          minWidth: mobileBase + 4,
          cellStyle: {
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
          cellRenderer: SharedActionsGridComponent,
          cellRendererParams: { onAdd: this.addPermission.bind(this) },
        },
        {
          field: 'actions',
          headerName: 'Acciones',
          minWidth: mobileBase + 18,
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
    } else if (w < 1024) {
      const wide = 178;
      this.columnDefs = [
        { field: 'id_usuario', headerName: '#', minWidth: wide },
        { field: 'nombre_usuario', headerName: 'Nombre', minWidth: wide },
        { field: 'curp', headerName: 'CURP', minWidth: wide },
        { field: 'telefono', headerName: 'Teléfono', minWidth: wide },
        {
          field: 'positions',
          headerName: 'Puestos',
          minWidth: wide,
          cellStyle: {
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
          cellRenderer: SharedActionsGridComponent,
          cellRendererParams: { onView: this.viewPosition.bind(this) },
        },
        {
          field: 'permissions',
          headerName: 'Permisos',
          minWidth: wide,
          cellStyle: {
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
          cellRenderer: SharedActionsGridComponent,
          cellRendererParams: { onAdd: this.addPermission.bind(this) },
        },
        {
          field: 'actions',
          headerName: 'Acciones',
          minWidth: wide + 40, // proporcional al nuevo ancho base
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
    } else {
      this.columnDefs = [
        {
          field: 'id_usuario',
          headerName: '#',
          flex: 1,
          maxWidth: 150,
          minWidth: 100,
        },
        {
          field: 'nombre_usuario',
          headerName: 'Nombre del Usuario',
          flex: 1,
          minWidth: 180,
        },
        { field: 'curp', flex: 1, minWidth: 220 },
        { field: 'telefono', flex: 1, minWidth: 140 },
        {
          field: 'positions',
          filter: false,
          headerName: 'Puestos',
          cellStyle: {
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
          cellRenderer: SharedActionsGridComponent,
          cellRendererParams: { onView: this.viewPosition.bind(this) },
          flex: 1,
          maxWidth: 125,
          minWidth: 120,
        },
        {
          field: 'permissions',
          filter: false,
          headerName: 'Permisos',
          cellStyle: {
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
          cellRenderer: SharedActionsGridComponent,
          cellRendererParams: { onAdd: this.addPermission.bind(this) },
          flex: 1,
          maxWidth: 125,
          minWidth: 120,
        },
        {
          field: 'actions',
          headerName: 'Acciones',
          filter: false,
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
          flex: 1,
          maxWidth: 215,
          minWidth: 120,
        },
      ];
    }
    this.cdr.detectChanges();
  }

  // Método para cargar los datos desde el servicio `usersService`.
  loadData(): void {
    //console.log(this.user);
    this.usersService.getData(this.user?.id_usuario).subscribe({
      next: (data) => {
        this.rowData = [...data.users]; // Asigna los datos obtenidos al array `rowData`.
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
        // Si ocurre un error, se muestra un mensaje en la consola.
      },
    });
  }

  myTheme = themeQuartz.withParams({
    spacing: 10,
    foregroundColor: '#422b7c',
    headerBackgroundColor: '#e9ddff',
    rowHoverColor: '#fdf7ff',
  });
  // Configura un tema personalizado para la tabla ag-Grid usando parámetros como espaciado, colores, etc.

  public paginationPageSize = 10;
  // Define la cantidad de filas que se mostrarán por página en la paginación de la tabla.

  public paginationPageSizeSelector: number[] | boolean = [10, 25, 50];
  // Define las opciones de tamaño de página disponibles para la tabla.

  columnDefs: ColDef[] = [
    {
      field: 'id_usuario',
      headerName: '#',
      flex: 1,
      maxWidth: 150,
      minWidth: 100,
      // Configura la columna 'id_usuario' con un ancho flexible.
    },
    {
      field: 'nombre_usuario',
      headerName: 'Nombre del Usuario',
      flex: 1,
      minWidth: 180,
      // Configura la columna 'nombre' con un ancho flexible.
    },
    {
      field: 'curp',
      flex: 1,
      minWidth: 220,
      // Configura la columna 'curp' con un ancho flexible y un máximo de 100px.
    },
    {
      field: 'telefono',
      flex: 1,
      minWidth: 140,
      // Configura la columna 'telefono' con un ancho flexible y un máximo de 100px.
    },
    {
      field: 'positions',
      filter: false,
      headerName: 'Puestos',
      cellStyle: {
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: {
        onView: this.viewPosition.bind(this),
      },
      flex: 1,
      maxWidth: 125,
      minWidth: 120,
    },
    {
      field: 'permissions',
      filter: false,
      headerName: 'Permisos',
      cellStyle: {
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      cellRenderer: SharedActionsGridComponent,
      cellRendererParams: {
        onAdd: this.addPermission.bind(this),
      },
      flex: 1,
      maxWidth: 125,
      minWidth: 120,
    },
    {
      field: 'actions',
      filter: false,
      headerName: 'Acciones',
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
      flex: 1,
      maxWidth: 215,
      minWidth: 180,
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

  // Métodos para las acciones de las filas
  view(row: any) {
    this.modalService.open(FormComponent, 'Ver registro', {
      data: { mode: 'view', id_usuario: row.id_usuario },
    });
    // Abre un modal para ver los detalles de un registro.
  }

  edit(row: any) {
    this.modalService.open(FormComponent, 'Editar registro', {
      data: {
        mode: 'edit',
        id_usuario: row.id_usuario,
        loadData: this.loadData.bind(this),
      },
    });
    // Abre un modal para editar un registro, pasando los datos y la función para recargar los datos.
  }

  delete(row: any) {
    this.alertService
      .confirm(
        `¿Seguro que deseas eliminar a ${row.nombre_usuario}?`,
        'Eliminar registro'
      )
      .then((result) => {
        if (result.isConfirmed) {
          // Si el usuario confirma, elimina el registro y recarga los datos.
          this.usersService
            .delete(this.user.id_usuario, row.id_usuario)
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
    // Abre un modal para agregar un nuevo registro y recargar los datos después de la operación.
  }

  viewPosition(row: any) {
    this.modalService.open(UserPositionComponent, 'Ver puesto(s)', {
      data: { mode: 'view', ct_usuario_id: row.id_usuario },
    });
  }

  // async addPermission(row: any) {
  //   try {
  //     // Obtenemos los permisos de módulos usando el servicio y esperamos su resultado
  //     const { modules } = await this.usersService
  //       .getModulesPermissions()
  //       .toPromise();

  //     // Si `getPermissionsUsers` es un observable, debes esperar su resultado con `await` o convertirlo en promesa
  //     const { permissions } = await this.usersService
  //       .getPermissionsUsers(row.id_usuario)
  //       .toPromise(); // Asegúrate de que `getPermissionsUsers` retorne un Observable

  //     // Abrimos el modal pasando los permisos y otros datos requeridos
  //     this.modalService.open(SharedAddPermissionsComponent, 'Agregar función', {
  //       data: {
  //         permissions, // Ahora `permissions` contiene el resultado de `getPermissionsUsers`
  //         mode: 'users',
  //         modules, // `modules` es el resultado de la promesa
  //         loadData: this.loadData.bind(this),
  //         savePermissions: this.savePermissions.bind(this),
  //         id_usuario: row.id_usuario,
  //       },
  //     });
  //   } catch (error) {
  //     console.error('Error al obtener permisos de módulos:', error);
  //   }
  // }

  // savePermissions(data: any): void {
  //   this.usersService.registerPermissionsUser(data).subscribe();
  // }

  async addPermission(row: any) {
    try {
      // Obtenemos los permisos de módulos usando el servicio y esperamos su resultado
      const { modules } = await this.usersService
        .getModulesPermissions()
        .toPromise();

      // Obtenemos los permisos actuales del usuario
      const { permissions } = await this.usersService
        .getPermissionsUsers(row.id_usuario)
        .toPromise();

      // Abrimos el modal pasando los datos requeridos
      this.modalService.open(SharedAddPermissionsComponent, 'Agregar función', {
        data: {
          permissions,
          mode: 'users',
          modules,
          loadData: this.loadData.bind(this),
          savePermissions: this.savePermissions.bind(this), // Guardar permisos seleccionados
          removePermissions: this.removePermissions.bind(this), // Eliminar permisos deseleccionados
          id_usuario: row.id_usuario,
        },
      });
    } catch (error) {
      console.error('Error al obtener permisos de módulos:', error);
    }
  }

  savePermissions(data: any): void {
    this.usersService.registerPermissionsUser(data).subscribe({
      next: () => {
        console.log('Permisos guardados correctamente.');
        this.loadData(); // Recarga los datos
      },
      error: (err) => console.error('Error al guardar permisos:', err),
    });
  }

  removePermissions(data: any): void {
    this.usersService.removePermissionsUser(data).subscribe({
      next: () => {
        this.loadData(); // Recarga los datos después de eliminar los permisos
      },
      error: (err) => {
        console.error('Error al eliminar los permisos:', err);
      },
    });
  }
}
