import { Component, AfterViewInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { SharedCustomModalComponent } from '../../../shared/shared-custom-modal/shared-custom-modal.component';
import { CommonModule } from '@angular/common';
import { CoreModalService } from '../../../core/services/core.modal.service';
import { CoreAlertService } from '../../../core/services/core.alert.service';
import { HistoryService } from './services/history.service';
import { History } from './interfaces/interfaces';
import { SharedActionsGridComponent } from '../../../shared/shared-actions-grid/shared-actions-grid.component';
import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import { injectSelector } from '@reduxjs/angular-redux';
import { RootState } from '../../../store';
import { localeText } from '../../../core/helpers/localText';

@Component({
  selector: 'app-history',
  imports: [AgGridAngular, SharedCustomModalComponent, CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent {
  public rowData: History[] = [];

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
    // {
    //   field: 'createdAt',
    //   headerName: 'Fecha',
    //   flex: 1,
    // },
    // {
    //   field: 'createdAt',
    //   headerName: 'Fecha y Hora',
    //   flex: 1,
    //   valueFormatter: (params) => {
    //     const fecha = new Date(params.value);
    //     return fecha.toLocaleString('es-ES', {
    //       year: 'numeric',
    //       month: 'long',
    //       day: 'numeric',
    //       hour: '2-digit',
    //       minute: '2-digit',
    //       second: '2-digit',
    //     }); // Ejemplo: "22 de mayo de 2025, 14:35:07"
    //   },
    // },
    {
      field: 'createdAt',
      headerName: 'Fecha y Hora',
      flex: 1,
      maxWidth: 200,
      minWidth: 240,
      valueFormatter: (params) => {
        const fecha = new Date(params.value);
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        const segundos = String(fecha.getSeconds()).padStart(2, '0');
        return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`; // Ejemplo: "22/05/2025 14:35:07"
      },
    },
    {
      field: 'ct_accion.nombre_accion',
      headerName: 'Acción',
      flex: 1,
      maxWidth: 175,
      minWidth: 140,
    },
    {
      field: 'ct_usuario.nombre_usuario',
      headerName: 'Usuario',
      flex: 1,
      maxWidth: 125,
      minWidth: 120,
    },
    {
      headerName: 'Detalles',
      flex: 2,
      minWidth: 400,
      valueGetter: (params) => {
        const {
          ct_accion_id,
          estatus_accion,
          ct_accion,
          ct_usuario,
          ct_tabla,
          detalles_error,
          registro_id,
        } = params.data;

        //console.log(ct_accion_id)

        // Validar existencia de campos específicos antes de usarlos
        if (ct_accion_id === 4 && !estatus_accion) {
          return detalles_error || 'Detalles no disponibles';
        }

        if (ct_accion_id === 4 && estatus_accion) {
          return ct_usuario && ct_accion
            ? `El usuario ${ct_usuario.nombre_usuario} ${ct_accion.descripcion}`
            : 'Información incompleta para la acción';
        }

        if (ct_accion_id !== 4) {
          return ct_usuario && ct_accion && ct_tabla
            ? `El usuario ${ct_usuario.nombre_usuario} ${ct_accion.descripcion} el registro con ID ${registro_id} de la tabla ${ct_tabla.nombre_tabla}`
            : 'Información incompleta para esta acción';
        }

        // Devolver un mensaje por defecto si ninguna condición aplica
        return 'Acción no reconocida o datos faltantes';
      },
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
    private historyService: HistoryService, // Inyecta el servicio de datos para acceder a las APIs.
    private alertService: CoreAlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.setResponsiveColumns();
    this.loadData();
    window.addEventListener('resize', () => this.setResponsiveColumns());
  }

  setResponsiveColumns(): void {
    if (window.innerWidth < 768) {
      // Configuración específica para móviles - exactamente 3 columnas visibles
      this.columnDefs = [
        {
          field: 'createdAt',
          headerName: 'Fecha y Hora',
          flex: 1,
          minWidth: 110,
          maxWidth: 130,
          valueFormatter: (params) => {
            const fecha = new Date(params.value);
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
            const horas = String(fecha.getHours()).padStart(2, '0');
            const minutos = String(fecha.getMinutes()).padStart(2, '0');
            const segundos = String(fecha.getSeconds()).padStart(2, '0');
            return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
          },
        },
        {
          field: 'ct_accion.nombre_accion',
          headerName: 'Acción',
          flex: 1,
          minWidth: 110,
          maxWidth: 130,
        },
        {
          field: 'ct_usuario.nombre_usuario',
          headerName: 'Usuario',
          flex: 1,
          minWidth: 110,
          maxWidth: 130,
        },
        {
          headerName: 'Detalles',
          flex: 1,
          minWidth: 110,
          maxWidth: 130,
          valueGetter: (params) => {
            const {
              ct_accion_id,
              estatus_accion,
              ct_accion,
              ct_usuario,
              ct_tabla,
              detalles_error,
              registro_id,
            } = params.data;

            if (ct_accion_id === 4 && !estatus_accion) {
              return detalles_error || 'Detalles no disponibles';
            }
            if (ct_accion_id === 4 && estatus_accion) {
              return ct_usuario && ct_accion
                ? `El usuario ${ct_usuario.nombre_usuario} ${ct_accion.descripcion}`
                : 'Información incompleta para la acción';
            }
            if (ct_accion_id !== 4) {
              return ct_usuario && ct_accion && ct_tabla
                ? `El usuario ${ct_usuario.nombre_usuario} ${ct_accion.descripcion} el registro con ID ${registro_id} de la tabla ${ct_tabla.nombre_tabla}`
                : 'Información incompleta para esta acción';
            }
            return 'Acción no reconocida o datos faltantes';
          },
        },
      ];
    } else {
      this.columnDefs = [
        {
          field: 'createdAt',
          headerName: 'Fecha y Hora',
          flex: 1,
          maxWidth: 200,
          minWidth: 240,
          valueFormatter: (params) => {
            const fecha = new Date(params.value);
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
            const horas = String(fecha.getHours()).padStart(2, '0');
            const minutos = String(fecha.getMinutes()).padStart(2, '0');
            const segundos = String(fecha.getSeconds()).padStart(2, '0');
            return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
          },
        },
        {
          field: 'ct_accion.nombre_accion',
          headerName: 'Acción',
          flex: 1,
          maxWidth: 175,
          minWidth: 140,
        },
        {
          field: 'ct_usuario.nombre_usuario',
          headerName: 'Usuario',
          flex: 1,
          maxWidth: 125,
          minWidth: 120,
        },
        {
          headerName: 'Detalles',
          flex: 2,
          minWidth: 400,
          valueGetter: (params) => {
            const {
              ct_accion_id,
              estatus_accion,
              ct_accion,
              ct_usuario,
              ct_tabla,
              detalles_error,
              registro_id,
            } = params.data;
            // Validar existencia de campos específicos antes de usarlos
            if (ct_accion_id === 4 && !estatus_accion) {
              return detalles_error || 'Detalles no disponibles';
            }

            if (ct_accion_id === 4 && estatus_accion) {
              return ct_usuario && ct_accion
                ? `El usuario ${ct_usuario.nombre_usuario} ${ct_accion.descripcion}`
                : 'Información incompleta para la acción';
            }

            if (ct_accion_id !== 4) {
              return ct_usuario && ct_accion && ct_tabla
                ? `El usuario ${ct_usuario.nombre_usuario} ${ct_accion.descripcion} el registro con ID ${registro_id} de la tabla ${ct_tabla.nombre_tabla}`
                : 'Información incompleta para esta acción';
            }

            // Devolver un mensaje por defecto si ninguna condición aplica
            return 'Acción no reconocida o datos faltantes';
          },
        },
      ];
    }
  }

  loadData(): void {
    this.historyService.getData().subscribe({
      next: (data) => {
        this.rowData = [...data.history];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar los datos:', error);
      },
    });
  }
}
